const connect = require('@aragon/connect');
const TokenManager = require('@aragon/connect-thegraph-tokens');
const Voting = require('@aragon/connect-thegraph-voting');
const Finance = require('@aragon/connect-finance');
const Web3 = require('web3');
const EMPTY_SCRIPT = '0x00000001';
const myaddress ='0xf9a0258c8d9c0eb2bdd62056843b313d10a18a27';
// Initiates the connection to an organization

const fetchVotes = async (myaddress) => {
	const org = await connect.connect(
		myaddress,
		'thegraph',
		{ chainId: 5 },
	)
    console.log(org);
    const apps = await org.apps();;
    const result = apps.find(obj => {
		return obj.name === 'voting';
	});
    const voting = new Voting.Voting(
		result.myaddress,
		'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-goerli',
		false,
	);
	const votes = await voting.votes();
	const processedVotes = await Promise.all(
		votes.map(async (vote) => processVote(vote, apps, org.provider)),
	);
	processedVotes.reverse();
	return processedVotes;
    };

const processVote = async (vote, apps, provider) => {
	if (vote.script === EMPTY_SCRIPT) {
		return vote;
	}

	const [{ description }] = await connect.describeScript(
		vote.script,
		apps,
		provider,
	);
	return { ...vote, metadata: description };
};

const fetchTokenHolders = async (myaddress) => {
	const org = await connect.connect(
		myaddress,
		'thegraph',
		{ chainId: 5 },
	);
	const apps = await org.apps();
	const result = apps.find(obj => {
		return obj.name === 'token-manager';
	});
	const tokenManager = new TokenManager.TokenManager(
		result.myaddress,
		TOKENS_APP_SUBGRAPH_URL,
	);
	return await tokenManager.token();
};

const votesSocket = async (myaddress, cbfunc, id) =>{
	let status = false;
	const org = await connect.connect(
		myaddress,
		'thegraph',
		{ chainId: 5 },
	);
	const apps = await org.apps();
	const result = apps.find(obj => {
		return obj.name === 'voting';
	});
	const voting = new Voting.Voting(
		result.myaddress,
		'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-goerli',
		false,
	);
	voting.onVotes(async (event)=>{
		if(!status) {
			status = true;
			return;
		}
		const processedVotes = await Promise.all(
			event.map(async (evt) => processVote(evt, apps, org.provider)),
		);
		console.log('got vote');

		cbfunc(processedVotes[processedVotes.length - 1], id);
	},
	);
};

const fetchBalance = async (myaddress) => {
	const org = await connect.connect(
		myaddress,
		'thegraph',
		{ chainId: 5 },
	);
	const apps = await org.apps();
	const result = apps.find(obj => {
		return obj.name === 'finance';
	});
	const finance = new Finance.Finance(
		result.myaddress,
		FINANCE_APP_SUBGRAPH_URL,
	);
	const wei = (await finance.balance('0x0000000000000000000000000000000000000000')).balance;
	const web3 = new Web3();
	const eth = web3.utils.fromWei(wei, 'ether');
	console.log(eth);
	return eth;
};

const fetchTx = async (myaddress) => {
	const org = await connect.connect(
		myaddress,
		'thegraph',
		{ chainId: 5 },
	);
	const apps = await org.apps();
	const result = apps.find(obj => {
		return obj.name === 'finance';
	});
	const finance = new Finance.Finance(
		result.myaddress,
		FINANCE_APP_SUBGRAPH_URL,
	);
	console.log(await finance.transactions());
	const txlist = await finance.transactions();
	const web3 = new Web3();
	for (let i = 0; i < txlist.length; i++) {
		txlist[i].amount = web3.utils.fromWei(txlist[i].amount, 'ether');
	}
	console.log(txlist);
	return txlist;
};

const txSocket = async (myaddress, callbck, id) => {
	let status = false;
	const org = await connect.connect(
		myaddress,
		'thegraph',
		{ chainId: 5 },
	);
	const apps = await org.apps();
	const result = apps.find(obj => {
		return obj.name === 'finance';
	});
	const finance = new Finance.Finance(
		result.myaddress,
		FINANCE_APP_SUBGRAPH_URL,
	);
	await finance.onTransactions((txlist)=>{
		if (!status) {
			status = true;
			return;
		}
		processTx(txlist, callbck, id);
	});

};

const processTx = (txlist, callbck, id) => {
	const web3 = new Web3();
	txlist[txlist.length - 1].amount = web3.utils.fromWei(txlist[txlist.length - 1].amount, 'ether');
	console.log(txlist[txlist.length - 1]);
	callbck(txlist[txlist.length - 1], id);
	return txlist[txlist.length - 1];

};

const orgAddressFinance = async (myaddress)=> {
	const org = await connect.connect(
		myaddress,
		'thegraph',
		{ chainId: 5 },
	);
	const apps = await org.apps();
	const result = apps.find(obj => {
		return obj.name === 'finance';
	});
	return result.myaddress;
};

const orgAddressVoting = async (myaddress)=> {
	const org = await connect.connect(
		myaddress,
		'thegraph',
		{ chainId: 5 },
	);
	const apps = await org.apps();
	const result = apps.find(obj => {
		return obj.name === 'voting';
	});
	return result.myaddress;
};

module.exports = {
	fetchVotes,
	fetchTokenHolders,
	votesSocket,
	fetchBalance,
	fetchTx,
	txSocket,
	orgAddressFinance,
	orgAddressVoting,
};


