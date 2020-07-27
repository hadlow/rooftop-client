export class Animation
{
	public static easeOutQuad(t: number, b: number, c: number, d: number)
	{
		return -c * (t /= d) * (t - 2) + b;
	}

	public static easeOutElastic(t: number, b: number, c: number, d: number)
	{
		let ts: number = (t /= d) * t;
		let tc: number = ts * t;

		return b + c * (33 * tc * ts + -106 * ts * ts + 126 * tc + -67 * ts + 15 * t);
	}

	public static easeInElastic(t: number, b: number, c: number, d: number)
	{
		var s = 1.70158;
		var p = 0;
		var a = c;
		
		if (t == 0) return b; if ((t /= d) == 1) return b + c; if(!p) p = d * .3;
		if (a < Math.abs(c)) { a = c; var s = p / 4; }
		else var s = p / (2 * Math.PI) * Math.asin (c / a);
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p )) + b;
	}

	public static easeInBounce(t: number, b: number, c: number, d: number)
	{
		return c - this.easeOutBounce (d - t, 0, c, d) + b;
	}

	public static easeOutBounce(t, b, c, d)
	{
		if((t /= d) < (1 / 2.75))
		{
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75)) {
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
		} else if (t < (2.5 / 2.75)) {
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
		} else {
			return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
		}
	}
}