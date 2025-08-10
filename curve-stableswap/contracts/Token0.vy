# @version 0.3.7
"""
@title ERC20 Token - Token0
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

@external
def __init__(_name: String[64], _symbol: String[32], _decimals: uint8, _supply: uint256):
    """
    @dev Contract constructor
    @param _name Token name
    @param _symbol Token symbol
    @param _decimals Number of decimals
    @param _supply Initial supply to mint to deployer
    """
    self.name = _name
    self.symbol = _symbol
    self.decimals = _decimals
    self.totalSupply = _supply
    self.balanceOf[msg.sender] = _supply
    log Transfer(ZERO_ADDRESS, msg.sender, _supply)

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