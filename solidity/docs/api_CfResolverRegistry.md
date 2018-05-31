---
id: CfResolverRegistry
title: CfResolverRegistry
---

<div class="contract-doc"><div class="contract"><h2 class="contract-header"><span class="contract-kind">contract</span> CfResolverRegistry</h2><div class="source">Source: <a href="git+https://github.com/DecenterApps/MatchChannels/blob/v1.0.0/contracts/CfResolverRegistry.sol" target="_blank">CfResolverRegistry.sol</a></div></div><div class="index"><h2>Index</h2><ul><li><a href="CfResolverRegistry.html#deployContract">deployContract</a></li><li><a href="CfResolverRegistry.html#getContract">getContract</a></li></ul></div><div class="reference"><h2>Reference</h2><div class="functions"><h3>Functions</h3><ul><li><div class="item function"><span id="deployContract" class="anchor-marker"></span><h4 class="name">deployContract</h4><div class="body"><code class="signature">function <strong>deployContract</strong><span>(bytes _contractCode, address[] _players, uint8[] _v, bytes32[] _r, bytes32[] _s) </span><span>public </span></code><hr/><div class="description"><p>Deploys the resolver with the bytecode both the users agreed on.</p></div><dl><dt><span class="label-parameters">Parameters:</span></dt><dd><div><code>_contractCode</code> - Bytecode of the contract to be deployed</div><div><code>_players</code> - Adresses of the players which signed the contract code</div><div><code>_v</code> - uint8[]</div><div><code>_r</code> - bytes32[]</div><div><code>_s</code> - bytes32[]</div></dd></dl></div></div></li><li><div class="item function"><span id="getContract" class="anchor-marker"></span><h4 class="name">getContract</h4><div class="body"><code class="signature">function <strong>getContract</strong><span>(bytes32 _cfAddress) </span><span>public </span><span>view </span><span>returns  (address) </span></code><hr/><dl><dt><span class="label-parameters">Parameters:</span></dt><dd><div><code>_cfAddress</code> - bytes32</div></dd><dt><span class="label-return">Returns:</span></dt><dd>address</dd></dl></div></div></li></ul></div></div></div>