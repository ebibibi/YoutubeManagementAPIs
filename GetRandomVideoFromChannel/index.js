module.exports = async function (context, req) {
    YoutubeAPIKey = "AIzaSyB8Z8fgJi_ZXDaDkrfa2v-8GjvF8Ic8ra4"
    YoutubeUserID = "UCtzUHamNE1ZeWDVzcO7dYBA"

    if (req.body && req.body.youtubeapikey && req.body.youtubeuserid) {
        YoutubeAPIKey = req.body.youtubeapikey
        YoutubeUserID = req.body.youtubeuserid

        var video = await getRamdomVideo(YoutubeAPIKey, YoutubeUserID);
        context.log(video);

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: video
        };

    } else {
        context.res = {
            status: 400,
            body: "Please pass a youtubeapikey and youtubeuserid in the request body"
        };
    }


    async function getRamdomVideo(YoutubeAPIKey, YoutubeUserID) {
        const { google } = require("googleapis");
        const youtubeClient = google.youtube({
            version: "v3",
            auth: YoutubeAPIKey,
        });
        // https://developers.google.com/youtube/v3/docs/channels/list
        response = await youtubeClient.channels.list({
            id: YoutubeUserID,
            part: 'contentDetails',
        });
        if (response.data) {
            playlistId = response.data.items[0].contentDetails.relatedPlaylists.uploads;
            context.log(playlistId);
        }
        var videoList = []
        var requestOptions = {
            playlistId: playlistId,
            part: 'snippet',
            maxResults: 50,
        }
        response = await youtubeClient.playlistItems.list(requestOptions);
        context.log("checking response");
        context.log(response);

        do {
            if (response.data) {
                response.data.items.forEach(function (item) {
                    videoList.push(item);
                });
            }

            context.log("first page is finished.")
            context.log("nextpagetoken?")
            context.log(typeof response.data.nextPageToken === "undefined")

            if (typeof response.data.nextPageToken === "undefined") {
                hasNext = false;
                context.log("hasNext = false")
            } else {
                hasNext = true;
                context.log("hasNext = false")

                requestOptions.pageToken = response.data.nextPageToken
                response = await youtubeClient.playlistItems.list(requestOptions);

                context.log("got new response");
                context.log(response);
                context.log("xxxxxxxxxxxxxx");
            }
        } while (hasNext)
        var video = videoList[Math.floor(Math.random() * videoList.length)];
        return video.snippet
    }
};
