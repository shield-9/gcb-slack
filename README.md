# gcb-slack
Post Google Cloud Build Information to Slack

See https://cloud.google.com/cloud-build/docs/configure-third-party-notifications?hl=en to setup your Slack app for this integration.

```
gcloud functions deploy subscribeSlack --trigger-topic cloud-builds --runtime nodejs10 --set-env-vars "SLACK_WEBHOOK_URL=[YOUR_SLACK_WEBHOOK_URL]" --region asia-northeast1
```

