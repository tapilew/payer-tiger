import type { AbiItem } from "viem";

export const fujiPayerRouterAbi: AbiItem[] = [
	{
		inputs: [],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "contentId",
				type: "bytes32",
			},
			{
				indexed: true,
				internalType: "address",
				name: "payer",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "creator",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
		],
		name: "ContentAccessed",
		type: "event",
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "_handle",
				type: "string",
			},
			{
				internalType: "address",
				name: "_payee",
				type: "address",
			},
		],
		name: "addPayee",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "_handle",
				type: "string",
			},
		],
		name: "getPayee",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "owner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "contentId",
				type: "bytes32",
			},
			{
				internalType: "string",
				name: "creatorHandle",
				type: "string",
			},
			{
				internalType: "address",
				name: "token",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
		],
		name: "payAndLogAccess",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32",
			},
		],
		name: "payees",
		outputs: [
			{
				internalType: "string",
				name: "handle",
				type: "string",
			},
			{
				internalType: "address",
				name: "payee",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "source",
				type: "string",
			},
		],
		name: "toBytes32",
		outputs: [
			{
				internalType: "bytes32",
				name: "result",
				type: "bytes32",
			},
		],
		stateMutability: "pure",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "_handle",
				type: "string",
			},
			{
				internalType: "address",
				name: "_newPayee",
				type: "address",
			},
		],
		name: "updatePayee",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
];
