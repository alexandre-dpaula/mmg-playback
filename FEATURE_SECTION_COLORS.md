# Feature: Progress Bar Colors Based on Section Timestamps

## Overview
The YouTube player progress bar now changes color dynamically based on the active section of the song, using timestamps stored in the database.

## Implementation Details

### 1. Database Schema
- **Column Added**: `section_timestamps` (JSONB) in the `tracks` table
- **Format**: `{"I": 0, "V1": 15, "R1": 45, "V2": 75, "R2": 105, "PO": 135, "R3": 165}`
- **Migration File**: [APPLY_MIGRATION.sql](APPLY_MIGRATION.sql)

### 2. Components Modified

#### YouTubePlayer.tsx ([src/components/YouTubePlayer.tsx](src/components/YouTubePlayer.tsx))
- Added `sectionTimestamps` prop to receive section timing data
- Implemented `getSectionColor()` function to map section types to colors
- Implemented `getCurrentSectionColor()` function to determine active section color
- Progress bar now uses dynamic `backgroundColor` based on current playback time
- Color palette matches SongMap component for consistency

#### TrackDetails.tsx ([src/pages/TrackDetails.tsx](src/pages/TrackDetails.tsx))
- Added `section_timestamps` to database query
- Passes `section_timestamps` to YouTubePlayer component
- Implements `handleYouTubeTimeUpdate()` callback for auto-scroll synchronization
- Clicking sections in SongMap now seeks YouTube player to the correct timestamp

#### SongMap.tsx ([src/components/SongMap.tsx](src/components/SongMap.tsx))
- Provides color mapping reference (already existed)
- Used as the source of truth for section colors

### 3. Color Palette
The following colors are used for different section types:

| Section Type | Color | Hex Code |
|--------------|-------|----------|
| I (Intro) | Yellow | #F1C500 |
| V (Verse) | Light Blue | #4CB4FF |
| S (Solo) | Red | #FF4848 |
| C/R (Chorus/Refrão) | Orange | #F59D00 |
| PR/PC (Pré-Refrão/Pre-Chorus) | Green | #34CD62 |
| P/PO (Ponte/Bridge) | Green | #34CD62 |
| B (Bridge) | Purple | #9A58BB |
| TA/T (Turnaround) | Yellow | #F1C500 |
| TG (Tag) | Red | #FF4848 |
| IS/IN (Instrumental) | Purple | #9A58BB |
| RF (Riff) | Red | #FF4848 |
| O (Outro) | Blue | #45A2FF |
| IT (Interlúdio) | Purple | #9A58BB |
| Default | Green | #1DB954 |

### 4. User Experience

#### Visual Feedback
- Progress bar changes color smoothly as different sections play
- Colors match the SongMap section buttons for consistency
- Provides visual indication of song structure during playback

#### Interaction
- Clicking a section in SongMap seeks to that timestamp
- Toast notification shows section name and timestamp
- Auto-scroll keeps lyrics synchronized with playback

## How to Use

### Adding Timestamps to a Track

1. Execute the migration SQL to add the `section_timestamps` column:
   ```sql
   -- Run in Supabase SQL Editor
   ALTER TABLE tracks
   ADD COLUMN IF NOT EXISTS section_timestamps JSONB DEFAULT '{}'::jsonb;
   ```

2. Find your track ID:
   ```sql
   SELECT id, titulo, versao
   FROM tracks
   WHERE titulo ILIKE '%your song name%';
   ```

3. Add timestamps for each section:
   ```sql
   UPDATE tracks
   SET section_timestamps = '{
     "I": 0,
     "V1": 15,
     "PR": 45,
     "R1": 60,
     "V2": 90,
     "R2": 120,
     "S": 150,
     "PO": 180,
     "R3": 210,
     "O": 240
   }'::jsonb
   WHERE id = 'your-track-id';
   ```

   **Available Section Types:**
   - `I` - Intro
   - `V1`, `V2`, `V3` - Verses
   - `PR` - Pré-Refrão (Pre-Chorus)
   - `R` - Refrão (Chorus) - use when all choruses are identical
   - `R1`, `R2`, `R3` - Different chorus variations
   - `S` - Solo
   - `PO` - Ponte (Bridge)
   - `B` - Bridge (alternative)
   - `IS` - Instrumental
   - `O` - Outro
   - `TA` - Turnaround
   - `TG` - Tag
   - `IT` - Interlúdio (Interlude)
   - `RF` - Refrão Final (Final Chorus)

### Example: Adding Timestamps for "Sublime"
See [ADD_TIMESTAMPS_SUBLIME.sql](ADD_TIMESTAMPS_SUBLIME.sql) for a complete example.

## Testing

### Manual Testing Steps
1. Add timestamps to a track using the SQL commands above
2. Open the track in the app
3. Play the YouTube video
4. Observe:
   - Progress bar changes color as sections change
   - Colors match the SongMap buttons
   - Clicking SongMap sections seeks to correct timestamps
   - Auto-scroll follows the playback

### Debug Logs
The implementation includes console logs for debugging:
- `[YouTubePlayer] Seção atual:` - Shows active section and color
- `[TrackDetails] Clicou na seção:` - Shows section clicks
- `[TrackDetails] Timestamps disponíveis:` - Shows available timestamps

## Future Enhancements

Potential improvements:
1. **Auto-timestamp Detection**: Use audio analysis to automatically detect section changes
2. **Manual Timestamp Editor**: UI for adding/editing timestamps without SQL
3. **Section Markers on Progress Bar**: Visual markers showing where sections start
4. **Timestamp Import**: Import timestamps from external sources (e.g., Spotify, YouTube chapters)
5. **Color Customization**: Allow users to customize section colors

## Files Created/Modified

### New Files
- `FEATURE_SECTION_COLORS.md` - This documentation
- `APPLY_MIGRATION.sql` - Database migration
- `ADD_TIMESTAMPS_SUBLIME.sql` - Example timestamps for testing

### Modified Files
- `src/components/YouTubePlayer.tsx` - Color logic
- `src/pages/TrackDetails.tsx` - Integration and callbacks
- `src/components/SongMap.tsx` - Section color reference

## Technical Notes

### Performance
- Color calculation runs on every time update (100ms interval)
- Optimized to only search through section timestamps when playing
- No significant performance impact observed

### Browser Compatibility
- Uses CSS `backgroundColor` property (widely supported)
- Requires YouTube IFrame API (standard)
- Tested on modern browsers (Chrome, Safari, Firefox)

### Edge Cases Handled
- Missing timestamps: Falls back to default green color
- Invalid section IDs: Uses default color
- Empty timestamps object: Uses default color
- Malformed data: Graceful degradation

## Support

For issues or questions:
- Check browser console for debug logs
- Verify timestamps are correctly formatted JSONB
- Ensure section labels match between cifra content and timestamps
