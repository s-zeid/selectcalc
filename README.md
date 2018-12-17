SelectCalc
==========

Turn any form field into a powerful calculator!  
<https://addons.mozilla.org/en-US/firefox/addon/selectcalc/>  
<https://code.s.zeid.me/selectcalc>

(To build from source, install
[web-ext](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext)
and run `git submodule update --init --recursive` followed by `make` on a
Unix-like system.)

*                        *                        *                        *


This add-on lets you calculate mathematical expressions in input fields and
text areas.  To use, simply select the expression you want to calculate and
press `Ctrl + Alt + e` (`Command + Option + e` on macOS).  (You can also
right-click and choose `SelectCalc`.)  The selection will be replaced with the
result.


Expression Syntax
-----------------

You can use most common operators and many common functions, and the constants
`\pi`, `\e`, and `\tau`.  [A full list of operators and functions may be found
here](https://github.com/silentmatt/expr-eval/blob/v1.2.2/README.md#expression-syntax),
but **be aware of the following differences**:

* Decimal math is used instead of floating point math (e.g. `0.3 - 0.2`
  will actually result in `0.1` instead of `0.09999999999999998`).  The
  only exceptions are factorials (`!` and `\fac`) and `\gamma`.
* Functions must be given as `\name` instead of `name`.
* Functions are not case-sensitive.
* Variables and property access are not supported.
* Logical operators (e.g. `==`, `&&`, `not`) return 1 and 0 instead of
  true and false.
* `||` means `or` instead of string concatenation.
* `##` means string concatenation (e.g. `2 ## 3` results in `23`). 

For ease of use, some aliases are available:

* `**` is an alias of `^` (exponentation).
* `~` is an alias of `\round`.
* `=` is an alias of `==`.
* `&&` and `||` are aliases of `\and` and `\or`.
* `^` before a number means `not <number>`.
* `#` is an alias of `\length`.
* `√` is an alias of `\sqrt`.
* `π` and `ℯ` are aliases of `\pi` and `\e`.

Some extra constants and functions are available:

* `\tau` and `τ` will return `2 * \pi`.
* `a // b`, `\divInt(a, b)`, and `\divToInt(a, b)` will divide `a` by `b`
  and drop the remainder (i.e. integer division).
* `\divmod(a, b)` will return the integer part and remainder of `a / b`
  separately (e.g. `\divmod(234, 60)` will return `3, 54`).
* `\isNaN(x)` will return `1` if `x` is `NaN`, or `0` otherwise.
* `\nan` will return `NaN`.
* `\inf` and `\infinity` will return `Infinity`.


Any invalid character will be removed from the expression before evaluating it,
so for example, if you select `that 2 + 2 = 5 is the archetypical untruth`,
that entire string would be replaced with `0`.  (This doesn't always result in
a successful calculation; e.g. `The square root of 4 is \sqrt(4), not 1` will
not work, but `The square root of four is \sqrt(4) and not one` will work.)


License
-------

This add-on is [free software](https://www.gnu.org/philosophy/free-sw.html)
released under the X11 License.  [Its source code may be found on
GitLab.](https://code.s.zeid.me/selectcalc)  All data is processed on your own
device (i.e. not sent anywhere) and no tracking or analytics scripts are used.

**DISCLAIMER**:
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


Notes
-----

Using SelectCalc removes the undo history for the field or text area where you
used it.  This is a browser bug and not something I can fix.

This add-on contains an easter egg that acts on certain expressions related to
_Nineteen Eighty-Four_.  This easter egg will not run unless you evaluate the
string "O'Brien's SelectCalc" immediately prior.  (Evaluating `\oBrien` will
insert that string; you would then need to evaluate a second time for the
easter egg to run.)
