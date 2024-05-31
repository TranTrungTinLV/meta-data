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
) => {
  const session = await connection.startSession();
  session.startTransaction();
  try {
    const res = await func(session);
    await session.commitTransaction();
    return res;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
