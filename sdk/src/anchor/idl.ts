export type DapProtocol = {
  "version": "1.0.0",
  "name": "dap_protocol",
  "instructions": [
    {
      "name": "initializeIncrement",
      "accounts": [
        {
          "name": "increment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "publishAsset",
      "accounts": [
        {
          "name": "datum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "increment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tariff",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tariffAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "shadow",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "filterAsset",
      "accounts": [
        {
          "name": "datum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeTariff",
      "accounts": [
        {
          "name": "tariff",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "transferTariffAuthority",
      "accounts": [
        {
          "name": "tariff",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "from",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setNewTariff",
      "accounts": [
        {
          "name": "tariff",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tariffAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newTariff",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "datum",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "shadow",
            "type": "publicKey"
          },
          {
            "name": "filtered",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "index",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "increment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "increment",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "tariff",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "tariff",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ImmutableAssets",
      "msg": "decentralized assets should be immutable."
    }
  ]
};

export const IDL: DapProtocol = {
  "version": "1.0.0",
  "name": "dap_protocol",
  "instructions": [
    {
      "name": "initializeIncrement",
      "accounts": [
        {
          "name": "increment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "publishAsset",
      "accounts": [
        {
          "name": "datum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "increment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tariff",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tariffAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "shadow",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "filterAsset",
      "accounts": [
        {
          "name": "datum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeTariff",
      "accounts": [
        {
          "name": "tariff",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "transferTariffAuthority",
      "accounts": [
        {
          "name": "tariff",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "from",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setNewTariff",
      "accounts": [
        {
          "name": "tariff",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tariffAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newTariff",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "datum",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "shadow",
            "type": "publicKey"
          },
          {
            "name": "filtered",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "index",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "increment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "increment",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "tariff",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "tariff",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ImmutableAssets",
      "msg": "decentralized assets should be immutable."
    }
  ]
};
