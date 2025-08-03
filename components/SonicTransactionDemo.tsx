'use client'

import { useState } from 'react'
import { useSonicTransactions } from '@/hooks/useSonicTransactions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Wallet, 
  Coins, 
  Bridge, 
  Stethoscope, 
  Info, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ArrowRight,
  ArrowLeft,
  Send,
  Download,
  Upload
} from 'lucide-react'

export function SonicTransactionDemo() {
  const [activeTab, setActiveTab] = useState('wallet')
  const [results, setResults] = useState<Record<string, any>>({})
  
  const {
    loading,
    error,
    clearError,
    connectWallet,
    getAccountAddress,
    getNativeBalance,
    getTokenBalance,
    transferToken,
    getTokenAllowance,
    approveToken,
    bridgeToSonic,
    claimOnSonic,
    bridgeToEthereum,
    claimOnEthereum,
    delegate,
    undelegate,
    withdraw,
    pendingRewards,
    claimRewards,
    getBlockNumber,
    getTransactionStatus,
    getTokenInfo,
  } = useSonicTransactions()

  // Form states
  const [walletAddress, setWalletAddress] = useState('0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c')
  const [tokenAddress, setTokenAddress] = useState('0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8')
  const [recipientAddress, setRecipientAddress] = useState('0x1234567890123456789012345678901234567890')
  const [amount, setAmount] = useState('1.0')
  const [privateKey, setPrivateKey] = useState('')
  const [txHash, setTxHash] = useState('')
  const [validatorId, setValidatorId] = useState('1')
  const [depositId, setDepositId] = useState('')
  const [withdrawalId, setWithdrawalId] = useState('')
  const [blockNumber, setBlockNumber] = useState('')

  const handleTransaction = async (action: string, params: Record<string, any> = {}) => {
    clearError()
    const result = await (params.fn as any)(...Object.values(params).filter(v => typeof v === 'string'))
    setResults(prev => ({ ...prev, [action]: result }))
  }

  const renderResult = (action: string) => {
    const result = results[action]
    if (!result) return null

    return (
      <Alert className={`mt-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-center gap-2">
          {result.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
          <AlertDescription className="font-medium">
            {result.success ? 'Success' : 'Error'}: {result.data || result.error}
          </AlertDescription>
        </div>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sonic Transaction Functions</h1>
        <p className="text-gray-600">Your comprehensive blockchain pal for Sonic network interactions</p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="bridge" className="flex items-center gap-2">
            <Bridge className="h-4 w-4" />
            Bridge
          </TabsTrigger>
          <TabsTrigger value="staking" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Staking
          </TabsTrigger>
          <TabsTrigger value="utility" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Utility
          </TabsTrigger>
        </TabsList>

        {/* Wallet & Account Functions */}
        <TabsContent value="wallet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet & Account Functions
              </CardTitle>
              <CardDescription>
                Connect wallets and manage account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleTransaction('connectWallet', { fn: connectWallet })}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                  Connect Wallet
                </Button>
                
                <Button 
                  onClick={() => handleTransaction('getAccountAddress', { fn: getAccountAddress })}
                  disabled={loading}
                  variant="outline"
                >
                  Get Account Address
                </Button>
                
                <Button 
                  onClick={() => handleTransaction('getNativeBalance', { 
                    fn: getNativeBalance, 
                    address: walletAddress 
                  })}
                  disabled={loading}
                  variant="outline"
                >
                  Get Native Balance
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="walletAddress">Wallet Address</Label>
                <Input
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter wallet address"
                />
              </div>
              
              {renderResult('connectWallet')}
              {renderResult('getAccountAddress')}
              {renderResult('getNativeBalance')}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Token Functions */}
        <TabsContent value="tokens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Token Functions
              </CardTitle>
              <CardDescription>
                Transfer tokens, check balances, and manage allowances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenAddress">Token Address</Label>
                  <Input
                    id="tokenAddress"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    placeholder="Token contract address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount to transfer"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipientAddress">Recipient Address</Label>
                <Input
                  id="recipientAddress"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Recipient wallet address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="privateKey">Private Key (for transactions)</Label>
                <Input
                  id="privateKey"
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Your private key"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleTransaction('getTokenBalance', { 
                    fn: getTokenBalance, 
                    address: walletAddress, 
                    tokenAddress 
                  })}
                  disabled={loading}
                  variant="outline"
                >
                  Get Token Balance
                </Button>
                
                <Button 
                  onClick={() => handleTransaction('transferToken', { 
                    fn: transferToken, 
                    tokenAddress, 
                    to: recipientAddress, 
                    amount, 
                    privateKey 
                  })}
                  disabled={loading || !privateKey}
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Transfer Token
                </Button>
                
                <Button 
                  onClick={() => handleTransaction('getTokenAllowance', { 
                    fn: getTokenAllowance, 
                    tokenAddress, 
                    owner: walletAddress, 
                    spender: recipientAddress 
                  })}
                  disabled={loading}
                  variant="outline"
                >
                  Get Allowance
                </Button>
                
                <Button 
                  onClick={() => handleTransaction('approveToken', { 
                    fn: approveToken, 
                    tokenAddress, 
                    spender: recipientAddress, 
                    amount, 
                    privateKey 
                  })}
                  disabled={loading || !privateKey}
                  variant="outline"
                >
                  Approve Token
                </Button>
              </div>
              
              {renderResult('getTokenBalance')}
              {renderResult('transferToken')}
              {renderResult('getTokenAllowance')}
              {renderResult('approveToken')}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bridging Functions */}
        <TabsContent value="bridge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bridge className="h-5 w-5" />
                Bridge Functions
              </CardTitle>
              <CardDescription>
                Bridge tokens between Ethereum and Sonic networks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bridgeAmount">Amount</Label>
                  <Input
                    id="bridgeAmount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount to bridge"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bridgeTokenAddress">Token Address</Label>
                  <Input
                    id="bridgeTokenAddress"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    placeholder="Token contract address"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleTransaction('bridgeToSonic', { 
                    fn: bridgeToSonic, 
                    tokenAddress, 
                    amount, 
                    privateKey 
                  })}
                  disabled={loading || !privateKey}
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Bridge to Sonic
                </Button>
                
                <Button 
                  onClick={() => handleTransaction('bridgeToEthereum', { 
                    fn: bridgeToEthereum, 
                    tokenAddress, 
                    amount, 
                    privateKey 
                  })}
                  disabled={loading || !privateKey}
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
                  Bridge to Ethereum
                </Button>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="depositId">Deposit ID</Label>
                  <Input
                    id="depositId"
                    value={depositId}
                    onChange={(e) => setDepositId(e.target.value)}
                    placeholder="Deposit ID from bridge transaction"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="blockNumber">Block Number</Label>
                  <Input
                    id="blockNumber"
                    value={blockNumber}
                    onChange={(e) => setBlockNumber(e.target.value)}
                    placeholder="Block number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleTransaction('claimOnSonic', { 
                    fn: claimOnSonic, 
                    depositBlockNumber: blockNumber, 
                    depositId, 
                    tokenAddress, 
                    amount, 
                    privateKey 
                  })}
                  disabled={loading || !privateKey || !depositId || !blockNumber}
                  variant="outline"
                >
                  Claim on Sonic
                </Button>
                
                <Button 
                  onClick={() => handleTransaction('claimOnEthereum', { 
                    fn: claimOnEthereum, 
                    withdrawalBlockNumber: blockNumber, 
                    withdrawalId: withdrawalId, 
                    tokenAddress, 
                    amount, 
                    privateKey 
                  })}
                  disabled={loading || !privateKey || !withdrawalId || !blockNumber}
                  variant="outline"
                >
                  Claim on Ethereum
                </Button>
              </div>
              
              {renderResult('bridgeToSonic')}
              {renderResult('bridgeToEthereum')}
              {renderResult('claimOnSonic')}
              {renderResult('claimOnEthereum')}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staking Functions */}
        <TabsContent value="staking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Staking Functions
              </CardTitle>
              <CardDescription>
                Delegate, undelegate, and manage staking rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validatorId">Validator ID</Label>
                  <Input
                    id="validatorId"
                    value={validatorId}
                    onChange={(e) => setValidatorId(e.target.value)}
                    placeholder="Validator ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stakingAmount">Amount</Label>
                  <Input
                    id="stakingAmount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount to stake"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleTransaction('delegate', { 
                    fn: delegate, 
                    validatorId, 
                    amount, 
                    privateKey 
                  })}
                  disabled={loading || !privateKey}
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Delegate
                </Button>
                
                <Button 
                  onClick={() => handleTransaction('undelegate', { 
                    fn: undelegate, 
                    validatorId, 
                    amount, 
                    privateKey 
                  })}
                  disabled={loading || !privateKey}
                  variant="outline"
                >
                  Undelegate
                </Button>
                
                <Button 
                  onClick={() => handleTransaction('pendingRewards', { 
                    fn: pendingRewards, 
                    delegator: walletAddress, 
                    validatorId 
                  })}
                  disabled={loading}
                  variant="outline"
                >
                  Check Rewards
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="withdrawalId">Withdrawal ID</Label>
                  <Input
                    id="withdrawalId"
                    value={withdrawalId}
                    onChange={(e) => setWithdrawalId(e.target.value)}
                    placeholder="Withdrawal ID from undelegate"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleTransaction('withdraw', { 
                    fn: withdraw, 
                    validatorId, 
                    withdrawalId, 
                    privateKey 
                  })}
                  disabled={loading || !privateKey || !withdrawalId}
                  variant="outline"
                >
                  Withdraw
                </Button>
                
                <Button 
                  onClick={() => handleTransaction('claimRewards', { 
                    fn: claimRewards, 
                    validatorId, 
                    privateKey 
                  })}
                  disabled={loading || !privateKey}
                  variant="outline"
                >
                  Claim Rewards
                </Button>
              </div>
              
              {renderResult('delegate')}
              {renderResult('undelegate')}
              {renderResult('withdraw')}
              {renderResult('pendingRewards')}
              {renderResult('claimRewards')}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Utility Functions */}
        <TabsContent value="utility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Utility Functions
              </CardTitle>
              <CardDescription>
                Get blockchain information and transaction status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleTransaction('getBlockNumber', { fn: getBlockNumber })}
                  disabled={loading}
                  variant="outline"
                >
                  Get Block Number
                </Button>
                
                <Button 
                  onClick={() => handleTransaction('getTokenInfo', { 
                    fn: getTokenInfo, 
                    tokenAddress 
                  })}
                  disabled={loading}
                  variant="outline"
                >
                  Get Token Info
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="txHash">Transaction Hash</Label>
                <Input
                  id="txHash"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Transaction hash to check status"
                />
              </div>
              
              <Button 
                onClick={() => handleTransaction('getTransactionStatus', { 
                  fn: getTransactionStatus, 
                  txHash 
                })}
                disabled={loading || !txHash}
                variant="outline"
              >
                Check Transaction Status
              </Button>
              
              {renderResult('getBlockNumber')}
              {renderResult('getTokenInfo')}
              {renderResult('getTransactionStatus')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 