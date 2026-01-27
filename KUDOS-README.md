# Staff Hub Kudos System

## Overview
The kudos system allows staff to publicly recognize and celebrate each other's contributions. Kudos appear on the homepage in a rotating showcase, and admins can moderate all submissions.

## Files Added

### 1. **kudos.json**
- Main data file containing all kudos entries and categories
- Structure:
  ```json
  {
    "kudos": [
      {
        "id": "k001",
        "from": "Staff Name",
        "to": "Recipient Name",
        "message": "Recognition message",
        "category": "Category name",
        "date": "2026-01-27T10:00:00Z",
        "status": "approved|pending",
        "pinned": false
      }
    ],
    "categories": ["Great Work", "Teamwork", ...]
  }
  ```

### 2. **kudos-submit.html**
- Public form for staff to submit kudos
- Fields: From (optional/anonymous), To, Category, Message
- Submissions go to "pending" status for admin review
- Currently stores in localStorage (in production, connect to backend API)

### 3. **kudos-admin.html**
- Admin interface for managing kudos
- Features:
  - View pending/approved/all kudos
  - Approve or reject pending submissions
  - Edit kudos text (fix typos, inappropriate content)
  - Pin important kudos to stay at top
  - Delete kudos
  - Statistics dashboard

### 4. **kudos-admin.js**
- JavaScript logic for the admin interface
- Handles all CRUD operations on kudos data

### 5. **kudos.js**
- Powers the rotating showcase on homepage
- Features:
  - Auto-rotates every 8 seconds
  - Shows only approved kudos from last 7 days
  - Pinned kudos appear first
  - Manual navigation with prev/next buttons
  - Dot indicators for multiple kudos
  - Pauses rotation when user manually navigates

### 6. **index.html** (updated)
- Added kudos showcase section
- Includes "Give Kudos" button
- Loads kudos.js for rotation functionality

## How It Works

### For Staff:
1. Click "Give Kudos" button on homepage
2. Fill out form (can submit anonymously)
3. Kudos posts immediately but awaits admin approval
4. Once approved, appears on homepage for 7 days

### For Admins:
1. Go to `kudos-admin.html`
2. Review pending kudos in the "Pending" tab
3. Approve, edit, or reject each submission
4. Pin special kudos to keep them at the top
5. Delete inappropriate content

## Installation

1. **Add new files to your server:**
   - kudos.json
   - kudos-submit.html
   - kudos-admin.html
   - kudos-admin.js
   - kudos.js

2. **Update index.html:**
   - Replace your current index.html with the updated version
   - Or manually add the kudos showcase section

3. **Link kudos-admin.html in your admin navigation**
   - Add to editor.html or wherever you manage admin links

## Production Setup

### Important: Backend Integration
The current implementation uses localStorage for demo purposes. For production:

1. **Create API endpoints:**
   - `POST /api/kudos` - Submit new kudos
   - `GET /api/kudos` - Fetch kudos (with filters)
   - `PUT /api/kudos/:id` - Update kudos
   - `DELETE /api/kudos/:id` - Delete kudos

2. **Update kudos-submit.html:**
   ```javascript
   // Replace localStorage with API call
   const response = await fetch('/api/kudos', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(kudosData)
   });
   ```

3. **Update kudos-admin.js:**
   - Replace localStorage operations with API calls
   - Add proper error handling
   - Implement authentication/authorization

4. **Add authentication:**
   - Protect kudos-admin.html with login
   - Only authorized users should approve/edit/delete

## Customization

### Change Auto-Rotate Speed
In `kudos.js`, line 169:
```javascript
autoRotateInterval = setInterval(() => {
  showNextKudos();
}, 8000); // Change 8000 to desired milliseconds
```

### Change Display Duration (7 days)
In `kudos.js`, line 20:
```javascript
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // Change -7 to desired days
```

### Add/Remove Categories
Edit `kudos.json`:
```json
"categories": [
  "Great Work",
  "Teamwork",
  "Your Custom Category"
]
```

### Style Changes
Both files include `<style>` blocks for easy customization:
- `index.html` - Showcase appearance
- `kudos-submit.html` - Form styling
- `kudos-admin.html` - Admin interface

## Best Practices

1. **Moderate regularly** - Check pending kudos daily
2. **Pin sparingly** - Only pin truly exceptional recognition
3. **Edit carefully** - Preserve original meaning when fixing typos
4. **Encourage participation** - Remind staff about kudos in meetings
5. **Celebrate publicly** - Share top kudos in team communications

## Troubleshooting

**Kudos not appearing on homepage:**
- Check that status is "approved" in kudos.json
- Verify date is within last 7 days
- Check browser console for JavaScript errors

**Admin page not loading kudos:**
- Ensure kudos.json is in correct location
- Check file permissions
- Verify JSON syntax is valid

**Form submissions not saving:**
- Currently using localStorage (temporary)
- Check browser console for errors
- Implement backend API for production

## Future Enhancements

Consider adding:
- Email notifications when someone receives kudos
- Monthly/quarterly kudos reports
- Kudos leaderboard (most given/received)
- Export to PDF/CSV
- Integration with Slack/Teams
- Anonymous feedback option
- Rich text formatting in messages
- Photo uploads
- Kudos badges/icons

## Support

For questions or issues, contact your IT department or the intranet administrator.
