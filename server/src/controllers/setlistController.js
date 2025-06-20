const { Setlist, SetlistSong, Song, User, Band, BandMember, SharedLink } = require('../models');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { calculateSetlistDuration, generateAccessToken } = require('../utils/helpers');
const io = require('../socket');

/**
 * @desc    Get all setlists for a band
 * @route   GET /api/bands/:bandId/setlists
 * @access  Private
 */
exports.getSetlists = asyncHandler(async (req, res) => {
  const { bandId } = req.params;
  const { userId } = req;

  // Check if user is a member of the band
  const bandMember = await BandMember.findOne({ 
    where: { bandId, userId }
  });

  if (!bandMember) {
    throw new ApiError(403, 'You are not a member of this band');
  }

  const setlists = await Setlist.findAll({
    where: { bandId },
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'profileImageUrl']
      },
      {
        model: SetlistSong,
        as: 'songs',
        include: [
          {
            model: Song,
            as: 'song',
            attributes: ['id', 'title', 'artist', 'key', 'tempo', 'durationSeconds']
          }
        ]
      }
    ],
    order: [['updatedAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: setlists.length,
    data: setlists
  });
});

/**
 * @desc    Get a single setlist by ID
 * @route   GET /api/bands/:bandId/setlists/:id
 * @access  Private
 */
exports.getSetlist = asyncHandler(async (req, res) => {
  const { bandId, id } = req.params;
  const { userId } = req;

  // Check if user is a member of the band or if setlist is public
  const bandMember = await BandMember.findOne({
    where: { bandId, userId }
  });

  const setlist = await Setlist.findOne({
    where: { id, bandId },
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'profileImageUrl']
      },
      {
        model: SetlistSong,
        as: 'songs',
        include: [
          {
            model: Song,
            as: 'song',
            attributes: ['id', 'title', 'artist', 'key', 'tempo', 'durationSeconds', 'notes'],
            include: [
              {
                model: User,
                as: 'creator',
                attributes: ['id', 'name']
              }
            ]
          }
        ],
        order: [['position', 'ASC']]
      }
    ]
  });

  if (!setlist) {
    throw new ApiError(404, 'Setlist not found');
  }

  // Check if the user has access to this setlist
  if (!bandMember && !setlist.isPublic) {
    // Check if the setlist is shared with the user via a shared link
    const sharedLink = req.headers.authorization?.startsWith('SharedLink ') 
      ? req.headers.authorization.split(' ')[1] 
      : null;

    if (!sharedLink) {
      throw new ApiError(403, 'You do not have access to this setlist');
    }

    const validSharedLink = await SharedLink.findOne({
      where: {
        resourceType: 'setlist',
        resourceId: id,
        accessToken: sharedLink,
        expiresAt: {
          [sequelize.Op.or]: [
            { [sequelize.Op.gt]: new Date() },
            { [sequelize.Op.eq]: null }
          ]
        }
      }
    });

    if (!validSharedLink) {
      throw new ApiError(403, 'Invalid or expired shared link');
    }
  }

  res.status(200).json({
    success: true,
    data: setlist
  });
});

/**
 * @desc    Create a new setlist
 * @route   POST /api/bands/:bandId/setlists
 * @access  Private
 */
exports.createSetlist = asyncHandler(async (req, res) => {
  const { bandId } = req.params;
  const { userId } = req;
  const { 
    name, 
    description, 
    venue, 
    eventDate, 
    isPublic = false,
    songs = [] 
  } = req.body;

  // Check if user is a member of the band
  const bandMember = await BandMember.findOne({
    where: { bandId, userId }
  });

  if (!bandMember) {
    throw new ApiError(403, 'You are not a member of this band');
  }

  const transaction = await sequelize.transaction();

  try {
    // Create the setlist
    const setlist = await Setlist.create({
      id: uuidv4(),
      name,
      description,
      venue,
      eventDate,
      isPublic,
      bandId,
      createdBy: userId,
      durationSeconds: 0 // Will be updated after adding songs
    }, { transaction });

    // Add songs to the setlist
    if (songs.length > 0) {
      // Validate that all songs belong to the band
      const songIds = songs.map(song => song.songId);
      const validSongs = await Song.findAll({
        where: { 
          id: songIds,
          bandId
        }
      });
      
      if (validSongs.length !== songIds.length) {
        throw new ApiError(400, 'One or more songs do not belong to this band');
      }

      // Create setlist songs with positions
      const setlistSongs = await Promise.all(songs.map(async (song, index) => {
        return SetlistSong.create({
          id: uuidv4(),
          setlistId: setlist.id,
          songId: song.songId,
          position: index,
          notes: song.notes || null,
          transitionNotes: song.transitionNotes || null
        }, { transaction });
      }));

      // Calculate total duration
      const songDurations = validSongs.map(song => song.durationSeconds || 0);
      const totalDuration = calculateSetlistDuration(songDurations);
      
      // Update the setlist with the total duration
      await setlist.update({
        durationSeconds: totalDuration
      }, { transaction });
    }

    await transaction.commit();

    // Get the created setlist with songs
    const createdSetlist = await Setlist.findByPk(setlist.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'profileImageUrl']
        },
        {
          model: SetlistSong,
          as: 'songs',
          include: [
            {
              model: Song,
              as: 'song',
              attributes: ['id', 'title', 'artist', 'key', 'tempo', 'durationSeconds']
            }
          ],
          order: [['position', 'ASC']]
        }
      ]
    });

    // Emit socket event for real-time updates
    io.to(`band-${bandId}`).emit('setlist:created', createdSetlist);

    res.status(201).json({
      success: true,
      data: createdSetlist
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * @desc    Update a setlist
 * @route   PUT /api/bands/:bandId/setlists/:id
 * @access  Private
 */
exports.updateSetlist = asyncHandler(async (req, res) => {
  const { bandId, id } = req.params;
  const { userId } = req;
  const { 
    name, 
    description, 
    venue, 
    eventDate, 
    isPublic,
    songs 
  } = req.body;

  // Check if user is a member of the band
  const bandMember = await BandMember.findOne({
    where: { bandId, userId }
  });

  if (!bandMember) {
    throw new ApiError(403, 'You are not a member of this band');
  }

  // Check if the setlist exists
  const setlist = await Setlist.findOne({
    where: { id, bandId }
  });

  if (!setlist) {
    throw new ApiError(404, 'Setlist not found');
  }

  const transaction = await sequelize.transaction();

  try {
    // Update the basic setlist info
    const updatedFields = {};
    if (name !== undefined) updatedFields.name = name;
    if (description !== undefined) updatedFields.description = description;
    if (venue !== undefined) updatedFields.venue = venue;
    if (eventDate !== undefined) updatedFields.eventDate = eventDate;
    if (isPublic !== undefined) updatedFields.isPublic = isPublic;

    await setlist.update(updatedFields, { transaction });

    // If songs are provided, update the setlist songs
    if (songs) {
      // Remove all existing setlist songs
      await SetlistSong.destroy({
        where: { setlistId: id },
        transaction
      });

      if (songs.length > 0) {
        // Validate that all songs belong to the band
        const songIds = songs.map(song => song.songId);
        const validSongs = await Song.findAll({
          where: { 
            id: songIds,
            bandId
          }
        });
        
        if (validSongs.length !== songIds.length) {
          throw new ApiError(400, 'One or more songs do not belong to this band');
        }

        // Create new setlist songs with positions
        await Promise.all(songs.map(async (song, index) => {
          return SetlistSong.create({
            id: uuidv4(),
            setlistId: id,
            songId: song.songId,
            position: index,
            notes: song.notes || null,
            transitionNotes: song.transitionNotes || null
          }, { transaction });
        }));

        // Calculate total duration
        const songDurations = validSongs.map(song => song.durationSeconds || 0);
        const totalDuration = calculateSetlistDuration(songDurations);
        
        // Update the setlist with the total duration
        await setlist.update({
          durationSeconds: totalDuration
        }, { transaction });
      } else {
        // If no songs, set duration to 0
        await setlist.update({
          durationSeconds: 0
        }, { transaction });
      }
    }

    await transaction.commit();

    // Get the updated setlist with songs
    const updatedSetlist = await Setlist.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'profileImageUrl']
        },
        {
          model: SetlistSong,
          as: 'songs',
          include: [
            {
              model: Song,
              as: 'song',
              attributes: ['id', 'title', 'artist', 'key', 'tempo', 'durationSeconds']
            }
          ],
          order: [['position', 'ASC']]
        }
      ]
    });

    // Emit socket event for real-time updates
    io.to(`band-${bandId}`).emit('setlist:updated', updatedSetlist);
    io.to(`setlist-${id}`).emit('setlist:updated', updatedSetlist);

    res.status(200).json({
      success: true,
      data: updatedSetlist
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * @desc    Delete a setlist
 * @route   DELETE /api/bands/:bandId/setlists/:id
 * @access  Private
 */
exports.deleteSetlist = asyncHandler(async (req, res) => {
  const { bandId, id } = req.params;
  const { userId } = req;

  // Check if user is a member of the band
  const bandMember = await BandMember.findOne({
    where: { bandId, userId }
  });

  if (!bandMember) {
    throw new ApiError(403, 'You are not a member of this band');
  }

  // Check if the setlist exists
  const setlist = await Setlist.findOne({
    where: { id, bandId }
  });

  if (!setlist) {
    throw new ApiError(404, 'Setlist not found');
  }

  // Check if user is an admin or the creator of the setlist
  if (bandMember.role !== 'admin' && setlist.createdBy !== userId) {
    throw new ApiError(403, 'You do not have permission to delete this setlist');
  }

  const transaction = await sequelize.transaction();

  try {
    // Delete all setlist songs
    await SetlistSong.destroy({
      where: { setlistId: id },
      transaction
    });

    // Delete all shared links for this setlist
    await SharedLink.destroy({
      where: { 
        resourceType: 'setlist',
        resourceId: id
      },
      transaction
    });

    // Delete the setlist
    await setlist.destroy({ transaction });

    await transaction.commit();

    // Emit socket event for real-time updates
    io.to(`band-${bandId}`).emit('setlist:deleted', { id, bandId });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * @desc    Duplicate a setlist
 * @route   POST /api/bands/:bandId/setlists/:id/duplicate
 * @access  Private
 */
exports.duplicateSetlist = asyncHandler(async (req, res) => {
  const { bandId, id } = req.params;
  const { userId } = req;
  const { name } = req.body;

  // Check if user is a member of the band
  const bandMember = await BandMember.findOne({
    where: { bandId, userId }
  });

  if (!bandMember) {
    throw new ApiError(403, 'You are not a member of this band');
  }

  // Check if the setlist exists
  const setlist = await Setlist.findOne({
    where: { id, bandId },
    include: [
      {
        model: SetlistSong,
        as: 'songs'
      }
    ]
  });

  if (!setlist) {
    throw new ApiError(404, 'Setlist not found');
  }

  const transaction = await sequelize.transaction();

  try {
    // Create a new setlist
    const newSetlist = await Setlist.create({
      id: uuidv4(),
      name: name || `${setlist.name} (Copy)`,
      description: setlist.description,
      venue: setlist.venue,
      eventDate: setlist.eventDate,
      isPublic: false, // Always create as private initially
      bandId,
      createdBy: userId,
      durationSeconds: setlist.durationSeconds
    }, { transaction });

    // Duplicate all setlist songs
    if (setlist.songs && setlist.songs.length > 0) {
      await Promise.all(setlist.songs.map(async (song) => {
        return SetlistSong.create({
          id: uuidv4(),
          setlistId: newSetlist.id,
          songId: song.songId,
          position: song.position,
          notes: song.notes,
          transitionNotes: song.transitionNotes
        }, { transaction });
      }));
    }

    await transaction.commit();

    // Get the created setlist with songs
    const duplicatedSetlist = await Setlist.findByPk(newSetlist.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'profileImageUrl']
        },
        {
          model: SetlistSong,
          as: 'songs',
          include: [
            {
              model: Song,
              as: 'song',
              attributes: ['id', 'title', 'artist', 'key', 'tempo', 'durationSeconds']
            }
          ],
          order: [['position', 'ASC']]
        }
      ]
    });

    // Emit socket event for real-time updates
    io.to(`band-${bandId}`).emit('setlist:created', duplicatedSetlist);

    res.status(201).json({
      success: true,
      data: duplicatedSetlist
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * @desc    Create a shared link for a setlist
 * @route   POST /api/bands/:bandId/setlists/:id/share
 * @access  Private
 */
exports.createSharedLink = asyncHandler(async (req, res) => {
  const { bandId, id } = req.params;
  const { userId } = req;
  const { expiresIn } = req.body; // Optional: Number of hours until expiration

  // Check if user is a member of the band
  const bandMember = await BandMember.findOne({
    where: { bandId, userId }
  });

  if (!bandMember) {
    throw new ApiError(403, 'You are not a member of this band');
  }

  // Check if the setlist exists
  const setlist = await Setlist.findOne({
    where: { id, bandId }
  });

  if (!setlist) {
    throw new ApiError(404, 'Setlist not found');
  }

  // Calculate expiration date if provided
  let expiresAt = null;
  if (expiresIn) {
    expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
  }

  // Generate access token
  const accessToken = generateAccessToken();

  // Create shared link
  const sharedLink = await SharedLink.create({
    id: uuidv4(),
    resourceType: 'setlist',
    resourceId: id,
    accessToken,
    expiresAt,
    createdBy: userId
  });

  res.status(201).json({
    success: true,
    data: {
      id: sharedLink.id,
      accessToken: sharedLink.accessToken,
      expiresAt: sharedLink.expiresAt,
      url: `${process.env.CLIENT_URL}/shared/setlist/${id}?token=${accessToken}`
    }
  });
});

module.exports = exports;