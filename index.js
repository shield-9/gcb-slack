const { IncomingWebhook } = require('@slack/webhook');
const url = process.env.SLACK_WEBHOOK_URL;

const webhook = new IncomingWebhook(url);

// subscribeSlack is the main function called by Cloud Functions.
module.exports.subscribeSlack = (pubSubEvent, context) => {
  const build = eventToBuild(pubSubEvent.data);

  // Skip if the current status is not in the status list.
  // Add additional statuses to list if you'd like:
  // QUEUED, WORKING, SUCCESS, FAILURE,
  // INTERNAL_ERROR, TIMEOUT, CANCELLED
  const status = ['SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT'];
  if (status.indexOf(build.status) === -1) {
    return;
  }

  // Send message to Slack.
  const message = createSlackMessage(build);
  webhook.send(message);
};

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = (data) => {
  return JSON.parse(Buffer.from(data, 'base64').toString());
}

// createSlackMessage creates a message from a build object.
const createSlackMessage = (build) => {
	duration = new Date(Date.UTC(1970, 1, 1, 0, 0, 0, new Date(build.finishTime) - new Date(build.createTime)))
	const message = {
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: `Build ${build.status} \`${build.id}\`:\n*<${build.logUrl}|Build Logs>*`
				}
			},
			{
				type: "section",
				fields: [
					{
						type: "mrkdwn",
						text: `*Status:*\n${build.status}`
					},
					{
						type: "mrkdwn",
						text: `*Duration:*\n${duration.toISOString().substring(11,19)}`
					}
				]
			}
		]
	};

	if (typeof build.source != "undefined" && typeof build.source.repoSource != "undefined") {
		commit = ""
		if (typeof build.sourceProvenance != "undefined" && typeof build.sourceProvenance.resolvedRepoSource != "undefined") {
			commit = " (SHA: " + build.sourceProvenance.resolvedRepoSource.commitSha + ")"
		}

		message.blocks[1].fields.push({
			type: "mrkdwn",
			text: `*Repository:*\n${build.source.repoSource.repoName}`
		})
		if (typeof build.source.repoSource.branchName != "undefined") {
			message.blocks[1].fields.push({
				type: "mrkdwn",
				text: `*Branch:*\n${build.source.repoSource.branchName} ${commit}`
			})
		}
		if (typeof build.source.repoSource.tagName != "undefined") {
			message.blocks[1].fields.push({
				type: "mrkdwn",
				text: `*Tag:*\n${build.source.repoSource.tagName} ${commit}`
			})
		}
	}

	return message;
}

