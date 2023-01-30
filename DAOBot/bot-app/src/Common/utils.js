const firebaseUtil = require('./firebase');
const ethAddressVerify = (address) => {
	return /^(0x){1}[0-9a-fA-F]{40}$/i.test(address);
};
const getProposalLink = async (chatId, number, address) => {
	const doc = await firebaseUtil.getDaoById(chatId);
	const name = doc.get('name');
	return (
		'https://client.aragon.org/#/esportsdao/organization/' + name + '/' + address + '/vote/' + number
	);
};

const getTokenLink = async (chatId, address) => {
	return 'https://client.aragon.org/#/esportsdao/organization/' + chatId + '/' + address;
};
const txLink = async (name, address) => {
	return 'https://client.aragon.org/#/esportsdao/organization/' + name + '/' + address;
};
const daoLink = (name) => {
	return 'https://client.aragon.org/#/esportsdao/organization/' + name + '/';
};
module.exports = {
	ethAddressVerify,
	getProposalLink,
	getTokenLink,
	txLink,
	daoLink,
};
