SelectCalc
==========

Calculates highlighted expressions in input fields and text areas.  
<https://addons.mozilla.org/en-US/firefox/addon/selectcalc/>  
<https://code.s.zeid.me/selectcalc>

This is a Firefox add-on that calculates simple expressions in input fields and
text areas.  To use, simply select the expression you want to calculate and
press `Ctrl + Alt + e` (`Command + Option + e` on macOS).  (You can also
right-click and choose `SelectCalc`.) The selection will be replaced with the
result.

Valid expressions may use the `+`, `-`, `*`, and `/` operators, parentheses,
negative (or explicitly positive) numbers, decimal places, equality tests (e.g.
`2 + 2 = 4` would give `1`), and whitespace.  Non-integer results are rounded
to eight decimal places.  Any invalid character will be removed from the
expression before evaluating it, so for example, if you select `that 2 + 2 = 5
is the archetypical untruth`, that entire string would be replaced with `0`.

Note: This add-on contains an easter egg that acts on certain expressions
related to _Nineteen Eighty-Four_. This easter egg will not run unless you
evaluate the string "O'Brien's SelectCalc" immediately prior.
