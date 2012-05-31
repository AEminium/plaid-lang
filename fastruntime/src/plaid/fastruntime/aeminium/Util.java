package plaid.fastruntime.aeminium;

import java.lang.Thread.UncaughtExceptionHandler;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.ConsoleHandler;
import java.util.logging.Formatter;
import java.util.logging.Handler;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import java.util.logging.StreamHandler;

import plaid.fastruntime.aeminium.runtime.ForkJoinPool;
import plaid.fastruntime.aeminium.runtime.ForkJoinWorkerThread;
import plaid.fastruntime.errors.PlaidIllegalOperationException;

public final class Util {
	private Util() {}
	
	public static final Logger LOG = Logger.getLogger(Util.class.toString());
	static {
		try {
			StreamHandler sh = new StreamHandler(System.out, new Formatter() {
			    private final DateFormat df = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss.SSS");
			    
			    public String format(LogRecord record) {
			        StringBuilder builder = new StringBuilder(1000);
			        builder.append(df.format(new Date(record.getMillis()))).append(" - ");
			        builder.append("[").append(record.getSourceClassName()).append(".");
			        builder.append(record.getSourceMethodName()).append("] - ");
			        builder.append("[").append(record.getLevel()).append("] --- ");
			        builder.append(formatMessage(record));
			        builder.append("\n");
			        return builder.toString();
			    }
			 
			    public String getHead(Handler h) {
			        return super.getHead(h);
			    }
			 
			    public String getTail(Handler h) {
			        return super.getTail(h);
			    }
			});
			LOG.setUseParentHandlers(false);
			LOG.addHandler(sh);
		} catch (SecurityException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 
	}
	
	
	static {
		Thread.setDefaultUncaughtExceptionHandler(new UncaughtExceptionHandler() {
			@Override
			public void uncaughtException(Thread t, Throwable e) {
				LOG.info("Thread " + t.toString() + " caught exception " + e.toString());
			}
		});
	}
	public static final ForkJoinPool POOL = new ForkJoinPool();
	
	public static final int CPU_COUNT = Runtime.getRuntime().availableProcessors();
	
	public static int parallelize = CPU_COUNT;

	public static final void triggerParallelism() {
		parallelize = (CPU_COUNT - POOL.getActiveThreadCount()) >> 1; 
	}

	public static final Datagroup GLOBAL_DATAGROUP = new Datagroup() {
		public final void enterAtomic() {
			super.enterAtomic();
			Thread t = Thread.currentThread();
			if ( t instanceof ForkJoinWorkerThread ) {
				((ForkJoinWorkerThread)t).atomicLevel++;
			} else {
				throw new PlaidIllegalOperationException("Cannot use atomic block with normal threads.");
			}
		};

		public final void leaveAtomic() {
			super.leaveAtomic();
			Thread t = Thread.currentThread();
			if ( t instanceof ForkJoinWorkerThread ) {
				((ForkJoinWorkerThread)t).atomicLevel--;
			} else {
				throw new PlaidIllegalOperationException("Cannot use atomic block with normal threads.");
			}
		};
	};
}
