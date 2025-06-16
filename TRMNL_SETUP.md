# RTD Transit Times - TRMNL Plugin Setup Guide

## Your Cloudflare Worker is Ready! 🎉

Your transit data API is deployed and working at:
**https://rtd-trmnl.willowidk.workers.dev**

## TRMNL Plugin Configuration

### Step 1: Create Private Plugin in TRMNL
1. Log into your TRMNL account
2. Make sure you have the Developer add-on (required for private plugins)
3. Go to Plugins tab and search for "Private Plugin"
4. Click to create a new private plugin

### Step 2: Plugin Settings
**Name:** RTD Transit Times (or whatever you prefer)

**Strategy:** Polling

**Polling URL:** 
```
https://rtd-trmnl.willowidk.workers.dev
```

**Polling Verb:** GET

**Polling Headers:** (leave empty - not needed)

**Polling Body:** (leave empty - not needed)

### Step 3: Markup Template
Copy and paste the template from `trmnl-template.html` into the TRMNL markup editor.

The template uses Liquid templating to display:
- 🚌 Route 17 Bus departures from Washington Ave & 16th St
- 🚊 W-Line Train departures from JeffCo Government Center (eastbound)
- Times in 24-hour format
- Automatic refresh timestamp

### Step 4: Test Your Plugin
1. Click "Force Refresh" in the plugin settings to test data fetching
2. Preview the generated screen
3. Add the plugin to a playlist and assign to your TRMNL device

## Data Format
Your API returns this JSON structure:
```json
{
  "bus": [{"time": "22:15"}, {"time": "22:29"}],
  "rail": [{"time": "22:25"}]
}
```

## Features
- ✅ Real-time RTD GTFS-RT feed data
- ✅ 24-hour time format
- ✅ Bus and train departure times
- ✅ Automatic 2-hour window filtering
- ✅ Error handling
- ✅ Clean, readable display
- ✅ Responsive design for TRMNL screens

## Customization Options
You can modify the template to:
- Change colors and styling
- Add stop names/descriptions
- Modify the layout
- Add more routes (by updating the Cloudflare Worker)

## Troubleshooting
- If no data appears, check the "Force Refresh" button
- The API only shows departures available in RTD's real-time feed (typically next 1-2 hours)
- GTFS-RT feeds have limited future departure data - this is normal

## Updates
To update the plugin data sources or add more routes:
1. Modify `/Users/willow/rtd-trmnl/src/index.ts`
2. Run `npx wrangler deploy` 
3. The TRMNL plugin will automatically fetch updated data

Your plugin is now ready to display live RTD transit times on your TRMNL device! 🚌🚊
