use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignatureLookupService {
    signatures: HashMap<String, FunctionSignature>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionSignature {
    pub signature: String,
    pub name: String,
    pub category: SignatureCategory,
    pub protocol: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SignatureCategory {
    ERC20,
    ERC721,
    ERC1155,
    UniswapV2,
    UniswapV3,
    SushiSwap,
    Compound,
    Aave,
    MakerDAO,
    Curve,
    Yearn,
    Governance,
    Staking,
    NFTMarketplace,
    Gaming,
    Generic,
    Unknown,
}

impl SignatureLookupService {
    pub fn new() -> Self {
        let mut service = Self {
            signatures: HashMap::new(),
        };
        service.initialize_signatures();
        service
    }

    pub fn lookup(&self, function_signature: &str) -> Option<&FunctionSignature> {
        self.signatures.get(function_signature)
    }

    pub fn add_signature(&mut self, sig: String, function_sig: FunctionSignature) {
        self.signatures.insert(sig, function_sig);
    }

    fn initialize_signatures(&mut self) {
        // The signatures you encountered
        self.add_signature(
            "75713a08".to_string(),
            FunctionSignature {
                signature: "0x75713a08".to_string(),
                name: "possibly_price_related".to_string(),
                category: SignatureCategory::Unknown,
                protocol: None,
                description: Some(
                    "This signature often appears in DeFi price oracle or trading contexts"
                        .to_string(),
                ),
            },
        );

        self.add_signature(
            "3d0e3ec5".to_string(),
            FunctionSignature {
                signature: "0x3d0e3ec5".to_string(),
                name: "possibly_swap_related".to_string(),
                category: SignatureCategory::Unknown,
                protocol: None,
                description: Some("Common in DEX and swap operations".to_string()),
            },
        );

        self.add_signature(
            "088890dc".to_string(),
            FunctionSignature {
                signature: "0x088890dc".to_string(),
                name: "possibly_liquidity_related".to_string(),
                category: SignatureCategory::Unknown,
                protocol: None,
                description: Some("Often seen in liquidity management functions".to_string()),
            },
        );

        self.add_signature(
            "623a10c0".to_string(),
            FunctionSignature {
                signature: "0x623a10c0".to_string(),
                name: "possibly_staking_related".to_string(),
                category: SignatureCategory::Unknown,
                protocol: None,
                description: Some(
                    "Commonly found in staking or yield farming contracts".to_string(),
                ),
            },
        );

        // Add comprehensive known signatures
        self.initialize_comprehensive_signatures();
    }

    fn initialize_comprehensive_signatures(&mut self) {
        // === ERC20 Standard Functions ===
        self.add_signature(
            "a9059cbb".to_string(),
            FunctionSignature {
                signature: "transfer(address,uint256)".to_string(),
                name: "transfer".to_string(),
                category: SignatureCategory::ERC20,
                protocol: None,
                description: Some("Standard ERC20 transfer function".to_string()),
            },
        );

        self.add_signature(
            "23b872dd".to_string(),
            FunctionSignature {
                signature: "transferFrom(address,address,uint256)".to_string(),
                name: "transferFrom".to_string(),
                category: SignatureCategory::ERC20,
                protocol: None,
                description: Some("Standard ERC20 transferFrom function".to_string()),
            },
        );

        self.add_signature(
            "095ea7b3".to_string(),
            FunctionSignature {
                signature: "approve(address,uint256)".to_string(),
                name: "approve".to_string(),
                category: SignatureCategory::ERC20,
                protocol: None,
                description: Some("Standard ERC20 approve function".to_string()),
            },
        );

        // === Uniswap V2 Functions ===
        self.add_signature(
            "38ed1739".to_string(),
            FunctionSignature {
                signature: "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)"
                    .to_string(),
                name: "swapExactTokensForTokens".to_string(),
                category: SignatureCategory::UniswapV2,
                protocol: Some("Uniswap V2".to_string()),
                description: Some("Swap exact amount of tokens for tokens".to_string()),
            },
        );

        self.add_signature(
            "7ff36ab5".to_string(),
            FunctionSignature {
                signature: "swapExactETHForTokens(uint256,address[],address,uint256)".to_string(),
                name: "swapExactETHForTokens".to_string(),
                category: SignatureCategory::UniswapV2,
                protocol: Some("Uniswap V2".to_string()),
                description: Some("Swap exact ETH for tokens".to_string()),
            },
        );

        // === Uniswap V3 Functions ===
        self.add_signature("414bf389".to_string(), FunctionSignature {
            signature: "exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))".to_string(),
            name: "exactInputSingle".to_string(),
            category: SignatureCategory::UniswapV3,
            protocol: Some("Uniswap V3".to_string()),
            description: Some("Uniswap V3 single pool exact input swap".to_string()),
        });

        self.add_signature(
            "c04b8d59".to_string(),
            FunctionSignature {
                signature: "exactInput((bytes,address,uint256,uint256,uint256))".to_string(),
                name: "exactInput".to_string(),
                category: SignatureCategory::UniswapV3,
                protocol: Some("Uniswap V3".to_string()),
                description: Some("Uniswap V3 multi-hop exact input swap".to_string()),
            },
        );

        self.add_signature(
            "ac9650d8".to_string(),
            FunctionSignature {
                signature: "multicall(bytes[])".to_string(),
                name: "multicall".to_string(),
                category: SignatureCategory::UniswapV3,
                protocol: Some("Uniswap V3".to_string()),
                description: Some("Execute multiple calls in a single transaction".to_string()),
            },
        );

        // === Compound Functions ===
        self.add_signature(
            "a0712d68".to_string(),
            FunctionSignature {
                signature: "mint(uint256)".to_string(),
                name: "mint".to_string(),
                category: SignatureCategory::Compound,
                protocol: Some("Compound".to_string()),
                description: Some("Supply assets to Compound market".to_string()),
            },
        );

        self.add_signature(
            "db006a75".to_string(),
            FunctionSignature {
                signature: "redeem(uint256)".to_string(),
                name: "redeem".to_string(),
                category: SignatureCategory::Compound,
                protocol: Some("Compound".to_string()),
                description: Some("Redeem cTokens for underlying assets".to_string()),
            },
        );

        // === Aave Functions ===
        self.add_signature(
            "e8eda9df".to_string(),
            FunctionSignature {
                signature: "deposit(address,uint256,address,uint16)".to_string(),
                name: "deposit".to_string(),
                category: SignatureCategory::Aave,
                protocol: Some("Aave".to_string()),
                description: Some("Deposit assets to Aave lending pool".to_string()),
            },
        );

        self.add_signature(
            "69328dec".to_string(),
            FunctionSignature {
                signature: "withdraw(address,uint256,address)".to_string(),
                name: "withdraw".to_string(),
                category: SignatureCategory::Aave,
                protocol: Some("Aave".to_string()),
                description: Some("Withdraw assets from Aave lending pool".to_string()),
            },
        );

        // === Curve Finance Functions ===
        self.add_signature(
            "3df02124".to_string(),
            FunctionSignature {
                signature: "exchange(int128,int128,uint256,uint256)".to_string(),
                name: "exchange".to_string(),
                category: SignatureCategory::Curve,
                protocol: Some("Curve".to_string()),
                description: Some("Exchange tokens on Curve".to_string()),
            },
        );

        self.add_signature(
            "0b4c7e4d".to_string(),
            FunctionSignature {
                signature: "add_liquidity(uint256[2],uint256)".to_string(),
                name: "add_liquidity".to_string(),
                category: SignatureCategory::Curve,
                protocol: Some("Curve".to_string()),
                description: Some("Add liquidity to Curve pool".to_string()),
            },
        );

        // === Yearn Finance Functions ===
        self.add_signature(
            "b6b55f25".to_string(),
            FunctionSignature {
                signature: "deposit(uint256)".to_string(),
                name: "deposit".to_string(),
                category: SignatureCategory::Yearn,
                protocol: Some("Yearn".to_string()),
                description: Some("Deposit tokens into Yearn vault".to_string()),
            },
        );

        self.add_signature(
            "2e1a7d4d".to_string(),
            FunctionSignature {
                signature: "withdraw(uint256)".to_string(),
                name: "withdraw".to_string(),
                category: SignatureCategory::Yearn,
                protocol: Some("Yearn".to_string()),
                description: Some("Withdraw tokens from Yearn vault".to_string()),
            },
        );

        // === NFT Marketplace Functions ===
        self.add_signature("fb0f3ee1".to_string(), FunctionSignature {
            signature: "atomicMatch_(address[14],uint256[18],uint8[8],bytes,bytes,bytes,bytes,bytes,bytes,bytes,bytes)".to_string(),
            name: "atomicMatch_".to_string(),
            category: SignatureCategory::NFTMarketplace,
            protocol: Some("OpenSea".to_string()),
            description: Some("OpenSea atomic match for NFT trading".to_string()),
        });

        // === Staking Functions ===
        self.add_signature(
            "a694fc3a".to_string(),
            FunctionSignature {
                signature: "stake(uint256)".to_string(),
                name: "stake".to_string(),
                category: SignatureCategory::Staking,
                protocol: None,
                description: Some("Stake tokens for rewards".to_string()),
            },
        );

        self.add_signature(
            "3d18b912".to_string(),
            FunctionSignature {
                signature: "getReward()".to_string(),
                name: "getReward".to_string(),
                category: SignatureCategory::Staking,
                protocol: None,
                description: Some("Claim staking rewards".to_string()),
            },
        );

        // === Governance Functions ===
        self.add_signature(
            "15373e3d".to_string(),
            FunctionSignature {
                signature: "vote(uint256,uint8,string)".to_string(),
                name: "vote".to_string(),
                category: SignatureCategory::Governance,
                protocol: None,
                description: Some("Vote on governance proposal".to_string()),
            },
        );

        self.add_signature(
            "da95691a".to_string(),
            FunctionSignature {
                signature: "propose(address[],uint256[],string[],bytes[],string)".to_string(),
                name: "propose".to_string(),
                category: SignatureCategory::Governance,
                protocol: None,
                description: Some("Create governance proposal".to_string()),
            },
        );

        // === Generic Common Functions ===
        self.add_signature(
            "70a08231".to_string(),
            FunctionSignature {
                signature: "balanceOf(address)".to_string(),
                name: "balanceOf".to_string(),
                category: SignatureCategory::Generic,
                protocol: None,
                description: Some("Get balance of address".to_string()),
            },
        );

        self.add_signature(
            "18160ddd".to_string(),
            FunctionSignature {
                signature: "totalSupply()".to_string(),
                name: "totalSupply".to_string(),
                category: SignatureCategory::Generic,
                protocol: None,
                description: Some("Get total token supply".to_string()),
            },
        );

        // === Additional DeFi Functions ===
        self.add_signature(
            "1249c58b".to_string(),
            FunctionSignature {
                signature: "mint()".to_string(),
                name: "mint".to_string(),
                category: SignatureCategory::Generic,
                protocol: None,
                description: Some("Mint new tokens".to_string()),
            },
        );

        self.add_signature(
            "42966c68".to_string(),
            FunctionSignature {
                signature: "burn(uint256)".to_string(),
                name: "burn".to_string(),
                category: SignatureCategory::Generic,
                protocol: None,
                description: Some("Burn tokens".to_string()),
            },
        );

        // === Flash Loan Functions ===
        self.add_signature(
            "ab9c4b5d".to_string(),
            FunctionSignature {
                signature: "flashLoan(address,uint256,bytes)".to_string(),
                name: "flashLoan".to_string(),
                category: SignatureCategory::Aave,
                protocol: Some("Aave".to_string()),
                description: Some("Execute flash loan".to_string()),
            },
        );

        // === Multisig Functions ===
        self.add_signature("6a761202".to_string(), FunctionSignature {
            signature: "execTransaction(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes)".to_string(),
            name: "execTransaction".to_string(),
            category: SignatureCategory::Generic,
            protocol: Some("Gnosis Safe".to_string()),
            description: Some("Execute multisig transaction".to_string()),
        });

        // === Proxy Functions ===
        self.add_signature(
            "3659cfe6".to_string(),
            FunctionSignature {
                signature: "upgradeTo(address)".to_string(),
                name: "upgradeTo".to_string(),
                category: SignatureCategory::Generic,
                protocol: None,
                description: Some("Upgrade proxy implementation".to_string()),
            },
        );

        // === Permit Functions (EIP-2612) ===
        self.add_signature(
            "d505accf".to_string(),
            FunctionSignature {
                signature: "permit(address,address,uint256,uint256,uint8,bytes32,bytes32)"
                    .to_string(),
                name: "permit".to_string(),
                category: SignatureCategory::ERC20,
                protocol: None,
                description: Some("Approve via signature (EIP-2612)".to_string()),
            },
        );
    }
}
