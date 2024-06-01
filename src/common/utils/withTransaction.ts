import { Connection } from 'mongoose';

export interface IWithTransactionOptions {
  onRollback?: CallableFunction;
}

export interface ITransactionSession {
  session: any;
}

export const withTransaction = async (
  connection: Connection,
  func: CallableFunction,
  retries: number = 3,
) => {
  const session = await connection.startSession();
  session.startTransaction();
  try {
    const res = await func(session);
    await session.commitTransaction();
    return res;
  } catch (error) {
    await session.abortTransaction();
    if (retries > 0) {
      return withTransaction(connection, func, retries - 1);
    }
    throw error;
  } finally {
    await session.endSession();
  }
};
