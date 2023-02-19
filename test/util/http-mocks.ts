
import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';

import * as mocks from 'node-mocks-http';


export type NextMocks = 
{
  req: NextApiRequest ;
  res: NextApiResponse;
} & ReturnType<typeof mocks.createMocks>

/**
 * Wrapper for 'node-mocks-http' 
 * @param args args
 * @returns mocks
 */
export function createMocks(
  ...args : Parameters<typeof mocks.createMocks>
) : NextMocks
{
  return mocks.createMocks(...args) as any as NextMocks;
}
