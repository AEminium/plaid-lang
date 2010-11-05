package plaid.compilerjava.types;

public class ChangeType {

	public static final ChangeType DEFAULTPARAM = new ChangeType(PermType.UNIT, PermType.UNIT, false);
	public static final ChangeType DYN = new ChangeType(PermType.DYN, PermType.DYN, false);
	
	private final PermType input;
	private final PermType output;
	private final boolean borrow;
	
	public ChangeType(PermType input, PermType output, boolean borrow) {
		this.input = input;
		this.output = output;
		this.borrow = borrow;
	}

	public PermType getInput() {
		return input;
	}

	public PermType getOutput() {
		return output;
	}
	
	public boolean borrows() {
		return borrow;
	}
}
