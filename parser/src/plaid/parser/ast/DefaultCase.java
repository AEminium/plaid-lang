package plaid.parser.ast;

import plaid.parser.Token;

public final class DefaultCase extends Case {

	public DefaultCase(Token token, Expr body) {
		super(token, body);
	}

	
	@Override
	public String toString() {
		return "default"+getBody().toString();		
	}
}
