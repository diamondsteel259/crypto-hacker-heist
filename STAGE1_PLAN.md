# Stage 1: Shop Enhancements - Implementation Plan

## Features to Add:
1. ✅ Search & Filter state (DONE - added searchQuery, currencyFilter)
2. ✅ Auto-expand Basic Laptop (DONE)
3. Enhanced Shop Header with user stats
4. Search bar UI component  
5. Filter buttons UI
6. Filter logic implementation
7. Bulk purchase buttons
8. ROI calculator tooltip
9. Update tab labels with emojis

## Current Status:
- Shop.tsx line 169-173: State variables added
- Shop.tsx line 169: Basic Laptop auto-expanded
- isConnected prop passed to EquipmentCard

## Next Steps:
Since Shop.tsx is 1400 lines, I'll create a LARGE targeted edit that:
- Adds enhanced shop header (around line 780-800)
- Adds search/filter UI before equipment list
- Implements filter logic in the equipment grouping section
- Updates tab labels with emojis
- Adds bulk purchase to EquipmentCard

Let's implement this all at once in a comprehensive way.
