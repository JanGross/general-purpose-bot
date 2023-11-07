module.exports = {
	timeout: 1000,
	global: true,
	name: 'Test timer every 1 sec',
    data: {
        i: 0
    },
	async tick(client, timer) {
		console.log(`Test timer ticked ${timer.data.i}`);
        timer.data.i++;
        if(timer.data.i >= 5) {
            clearInterval(timer.instance);
        }
	},
};