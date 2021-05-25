export default () => ({
    highWaterMark: parseInt(process.env.HIGH_WATERMARK) || 1000,
    natsUrl: process.env.NATS_URL || 'nats://localhost:4222'
});
