package plaid.util;

public class TimeForkJoinMain {
	public static void main(String[] args) {
		final long startTime = System.nanoTime();
		plaid.examples.forkJoin.main.main(args);
		//plaid.examples.integral.java.Integral.main(args);
		final long duration = System.nanoTime() -startTime;
		final double durSeconds = duration / 1000000000.0;
		System.out.println("Ran for : " + durSeconds  + "s");
	}
}
