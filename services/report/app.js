const RabbitMQService = require('./rabbitmq-service');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

var report = {};
const updateReport = async (products) => {
	products.forEach((product) => {
		if (product.name) {
			if (report[product.name]) report[product.name] = 1;
			else report[product.name]++;
		}
	});
};

const printReport = async () => {
	Object.entries(report).forEach(([key, value]) => {
		console.log(`${key} = ${value} vendas`);
	});
};

const hasProductsIn = (delivery) =>
	Array.isArray(delivery.products) && delivery.products.length > 0;

const processMessage = (msg) => {
	const delivery = JSON.parse(msg.content);

	try {
		if (hasProductsIn(delivery)) {
			updateReport(delivery);
			printReport();

			console.log('✔ SUCCESS: RELATÓRIO GERADO');
		} else
			console.warn(
				'X ERRO: NÃO É POSSÍVEL CRIAR RELATÓRIO PARA UM PEDIDO QUE NÃO POSSUI PRODUTOS'
			);
	} catch (error) {
		console.log(error);
		console.log(`X ERROR TO PROCESS: ${error.response}`);
	}
};

const consume = async () => {
	console.log(`INSCRITO COM SUCESSO NA FILA: ${process.env.RABBITMQ_QUEUE_NAME}`);
	try {
		await (
			await RabbitMQService.getInstance()
		).consume(process.env.RABBITMQ_QUEUE_NAME, (msg) => {
			processMessage(msg);
		});
	} catch (error) {
		console.error({ error });
	}
};

consume();
