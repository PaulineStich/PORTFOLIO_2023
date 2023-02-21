class PackHelper {
	commonConversionOps(f) {
		let rx = (f * 256) % 1;
		let ry = f % 1;
		ry -= (rx * 1.0) / 256.0;
		rx *= 256.0;
		ry *= 256.0;
		return Math.floor(ry * 256) + Math.floor(rx);
	}

	floatToInt16(f, divider) {
		const _f = Math.max(-0.5, Math.min(0.5, f / divider)) + 0.5;
		return this.commonConversionOps(_f);
	}

	unsignedFloatToInt16(f, divider) {
		const _f = Math.max(0, Math.min(1, f / divider));
		return this.commonConversionOps(_f);
	}

	int16ToFloat(int16, divider) {
		return (int16 / 65535 - 0.5) * divider;
	}

	int16ToUnsignedFloat(int16, divider) {
		return (int16 / 65535) * divider;
	}
}

export default new PackHelper();
