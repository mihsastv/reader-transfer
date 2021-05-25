export default () => ({
    highWaterMark: parseInt(process.env.HIGH_WATERMARK) || 1000,
    natsUrl: process.env.NATS_URL || 'nats://localhost:4222',
    socketUrl: process.env.SOCKET_URL || 'http://localhost:8181',
    selectTransport: process.env.SELECT_TRANSPORT === 'WS'
});
