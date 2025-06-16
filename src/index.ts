import * as GtfsRealtimeBindings from 'gtfs-realtime-bindings';

type FeedMessage = GtfsRealtimeBindings.transit_realtime.IFeedMessage;

// RTD GTFS-RT Feed Configuration
// Note: GTFS-RT feeds typically only include the next few upcoming departures,
// not a full 2-hour schedule. This is normal behavior for real-time transit feeds.
const STOP_IDS = {
	route17: '24412', // Washington Ave & 16th St
	wLine: '33948', // JeffCo Government Center Station (eastbound platform)
};

const ROUTE_IDS = {
	route17: '17',
	wLine: '103W',
};

async function fetchFeed(url: string): Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage> {
	const res = await fetch(url);
	const buffer = await res.arrayBuffer();

	return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
}

function getUpcomingDepartures(feed: FeedMessage, stopId: string, routeId: string): { time: string }[] {
	const now = Date.now() / 1000;
	const twoHoursLater = now + 2 * 60 * 60;

	const departures = (feed.entity ?? []).flatMap((entity: GtfsRealtimeBindings.transit_realtime.IFeedEntity) => {
		const tu = entity.tripUpdate;
		if (tu?.trip?.routeId === routeId && tu.stopTimeUpdate) {
			return tu.stopTimeUpdate
				.filter((s) => s.stopId === stopId && s.departure?.time !== undefined && typeof s.departure.time === 'number')
				.map((s) => {
					const departureTime = (s.departure as { time: number }).time;
					const departureDate = new Date(departureTime * 1000);
					return {
						time: departureDate.toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
							hour12: false, // 24-hour format
						}),
						timestamp: departureTime,
					};
				});
		}
		return [];
	});

	return departures
		.filter((dep) => dep.timestamp > now && dep.timestamp < twoHoursLater)
		.sort((a, b) => a.timestamp - b.timestamp)
		.map((dep) => ({ time: dep.time }));
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		try {
			const feed = await fetchFeed('https://www.rtd-denver.com/files/gtfs-rt/TripUpdate.pb');
			const bus = getUpcomingDepartures(feed, STOP_IDS.route17, ROUTE_IDS.route17);
			const rail = getUpcomingDepartures(feed, STOP_IDS.wLine, ROUTE_IDS.wLine);

			return new Response(JSON.stringify({ bus, rail }), {
				headers: { 
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type'
				},
			});
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return new Response(JSON.stringify({ error: message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
} satisfies ExportedHandler;
