# Product Overview

## Project name

Agent Blackbox

## One-liner

Verifiable execution receipts for autonomous AI agents on Casper.

## Problem

AI agents are beginning to spend funds, call paid APIs, sign transactions, and operate blockchain tools. Today, users often cannot prove what an agent was asked to do, which policy approved the action, what tool was called, how much it cost, or whether the visible result matches the original execution.

## Solution

Agent Blackbox creates cryptographic receipts for agent actions and anchors their hashes on Casper Testnet. The receipt trail helps users audit agent behavior, teams debug failures, and future protocols resolve disputes.

## Current status

- Receipt generation with `npm run demo`.
- Receipt verification in the dashboard, including paste/upload JSON checks.
- Tamper simulation that changes receipt data and demonstrates hash mismatch detection.
- Prepared `submit_receipt` Casper payload.
- Deployed Casper Testnet contract: `527101b5f588320530f091fdc390c852b9784df486722fae97fa518906892d0c`.
- Submitted receipt transaction: `b59446b16e1b17baa4081ee9152b7f4ac42c48fb6ddb3d9e1b0f6e22a7dd36ad`.
- Testnet deployment details recorded in the README.

## Product strengths

- Deterministic receipt hashing.
- Compact on-chain receipt registry.
- Dashboard replay for intent, policy, tool call, and anchoring state.
- Clear verifier workflow that recomputes the canonical receipt hash locally.
- Useful for agent wallets, paid APIs, x402 services, MCP tools, and DeFi/RWA agents.
- Casper-native contract entry point for anchoring receipts: `submit_receipt`.
