import { createServer } from 'vite';

async function testVite() {
    try {
        const server = await createServer({
            configFile: './vite.config.ts',
            server: {
                port: 5176
            }
        });
        console.log('Vite server created successfully.');
        await server.close();
        console.log('Vite server closed.');
    } catch (e) {
        console.error('VITE CRASH REPORT:');
        console.error(e);
    }
}

testVite();
