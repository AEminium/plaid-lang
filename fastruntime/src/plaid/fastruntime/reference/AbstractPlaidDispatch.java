package plaid.fastruntime.reference;

import plaid.fastruntime.ObjectValue;
import plaid.fastruntime.PlaidDispatch;
import plaid.fastruntime.PlaidState;
import plaid.fastruntime.Util;

public class AbstractPlaidDispatch implements PlaidDispatch {

	private final ObjectValue metadata;
	
	public AbstractPlaidDispatch(ObjectValue metadata) {
		super();
		this.metadata = metadata;
	}

	@Override
	public PlaidState change(PlaidState s) {
		ObjectValue changedValue = this.getObjectValue().changeState(s.getObjectValue());
		if (s.isStatic()) {
			return SimplePlaidState.makeStaticallyDefinedState(Util.DISPATCH_GEN.createStateInstance(changedValue));
		} else {
			return SimplePlaidState.makeDynamicallyDefinedState(Util.DISPATCH_GEN.createStateInstance(changedValue), s.getMemberDefinitions());
		}
	}

	@Override
	public boolean matches(String tag) {
		return getObjectValue().matches(tag);
	}

	@Override
	public ObjectValue getObjectValue() {
		return this.metadata;
	}

}
