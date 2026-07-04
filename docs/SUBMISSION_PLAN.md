# Buildathon Submission Plan

## Project name

Agent Blackbox

## One-liner

Verifiable execution receipts for autonomous AI agents on Casper.

## Problem

AI agents are beginning to spend funds, call paid APIs, sign transactions, and operate blockchain tools. Today, users often cannot prove what an agent was asked to do, which policy approved the action, what tool was called, how much it cost, or whether the visible result matches the original execution.

## Solution

Agent Blackbox creates cryptographic receipts for agent actions and anchors their hashes on Casper Testnet. The receipt trail helps users audit agent behavior, teams debug failures, and future protocols resolve disputes.

## Demo checklist

- Generate a receipt with `npm run demo`. Done.
- Show receipt verification in the dashboard. Done.
- Show prepared `submit_receipt` Casper payload. Done.
- Deploy the contract to Casper Testnet. Done: `527101b5f588320530f091fdc390c852b9784df486722fae97fa518906892d0c`.
- Submit at least one real receipt transaction. Done: `b59446b16e1b17baa4081ee9152b7f4ac42c48fb6ddb3d9e1b0f6e22a7dd36ad`.
- Add testnet deploy hash and contract hash to README before submission. Done.
- Record a public walkthrough video.

## Judging alignment

- Technical execution: deterministic receipt hashing, contract registry, dashboard replay.
- Innovation: accountability infrastructure for autonomous agents.
- Agentic AI: wraps autonomous decisions, tools, and policy checks.
- Real-world applicability: useful for agent wallets, paid APIs, x402 services, MCP tools, and DeFi/RWA agents.
- Working contracts: `submit_receipt` anchors execution receipts on Casper Testnet.
- UX/design: audit console focused on integrity, timeline, cost, and policy state.
