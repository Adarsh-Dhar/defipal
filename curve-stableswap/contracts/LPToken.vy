# @version 0.3.7
"""
@title Curve LP Token
@author Your Name
@license MIT
"""

from vyper.interfaces import ERC20

implements: ERC20

# Events
event Transfer:
    sender: indexed(address)
    receiver: indexed(address)
    value: uint256

event Approval:
    owner: indexed(address)
    spender: indexed(address)
    value: uint256

# State Variables
name: public(String[64])
symbol: public(String[32])
decimals: public(uint8)
totalSupply: public(uint256)
balanceOf: public(HashMap[address, uint256])
allowance: public(HashMap[address, HashMap[address, uint256]])
minter: public(address)

@external
def __init__(_name: String[64], _symbol: String[32]):
    """
    @dev Contract constructor
    @param _name Token name
    @param _symbol Token symbol
    """
    self.name = _name
    self.symbol = _symbol
    self.decimals = 18
    self.minter = msg.sender

@external
def set_minter(_minter: address):
    """
    @dev Set the minter address (should be the pool contract)
    @param _minter New minter address
    """
    assert msg.sender == self.minter  # dev: only minter
    self.minter = _minter

@external
def mint(_to: address, _value: uint256) -> bool:
    """
    @dev Mint tokens to an address (only callable by minter)
    @param _to Address to mint to
    @param _value Amount to mint
    """
    assert msg.sender == self.minter  # dev: only minter
    assert _to != ZERO_ADDRESS  # dev: mint to zero address
    
    self.totalSupply += _value
    self.balanceOf[_to] += _value
    log Transfer(ZERO_ADDRESS, _to, _value)
    return True

@external
def burnFrom(_to: address, _value: uint256) -> bool:
    """
    @dev Burn tokens from an address (only callable by minter)
    @param _to Address to burn from
    @param _value Amount to burn
    """
    assert msg.sender == self.minter  # dev: only minter
    assert self.balanceOf[_to] >= _value  # dev: insufficient balance
    
    self.totalSupply -= _value
    self.balanceOf[_to] -= _value
    log Transfer(_to, ZERO_ADDRESS, _value)
    return True

@external
def transfer(_to: address, _value: uint256) -> bool:
    """
    @dev Transfer tokens to another address
    @param _to Address to transfer to
    @param _value Amount to transfer
    """
    assert _to != ZERO_ADDRESS  # dev: transfer to zero address
    assert self.balanceOf[msg.sender] >= _value  # dev: insufficient balance
    
    self.balanceOf[msg.sender] -= _value
    self.balanceOf[_to] += _value
    log Transfer(msg.sender, _to, _value)
    return True

@external
def approve(_spender: address, _value: uint256) -> bool:
    """
    @dev Approve spender to spend tokens
    @param _spender Address to approve
    @param _value Amount to approve
    """
    assert _spender != ZERO_ADDRESS  # dev: approve to zero address
    
    self.allowance[msg.sender][_spender] = _value
    log Approval(msg.sender, _spender, _value)
    return True

@external
def transferFrom(_from: address, _to: address, _value: uint256) -> bool:
    """
    @dev Transfer tokens from one address to another
    @param _from Address to transfer from
    @param _to Address to transfer to
    @param _value Amount to transfer
    """
    assert _to != ZERO_ADDRESS  # dev: transfer to zero address
    assert self.balanceOf[_from] >= _value  # dev: insufficient balance
    assert self.allowance[_from][msg.sender] >= _value  # dev: insufficient allowance
    
    self.balanceOf[_from] -= _value
    self.balanceOf[_to] += _value
    self.allowance[_from][msg.sender] -= _value
    
    log Transfer(_from, _to, _value)
    return True