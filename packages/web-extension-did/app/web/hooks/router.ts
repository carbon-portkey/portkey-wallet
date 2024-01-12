import { NavigateOptions, useNavigate, To, useLocation, Path } from 'react-router';
import qs from 'query-string';

export interface CustomNavigateOptions<T> extends NavigateOptions {
  state?: T;
}

export interface CustomNavigateFunction<T> {
  (to: To, options?: CustomNavigateOptions<T>): void;
  (delta: number): void;
}

export function useNavigateState<T>(): CustomNavigateFunction<T> {
  const _navigate = useNavigate();
  return _navigate;
}

interface CustomLocationState<T> extends Path {
  state: T;
  key: string;
}

export function useLocationState<T>(): CustomLocationState<T> {
  const _location = useLocation();
  return _location;
}

interface LocationParams<T, K> {
  state: T;
  search: K;
  mergeData: T & K;
}

export function useLocationParams<T, K>(): LocationParams<T, K> {
  const { state } = useLocationState<T>();
  const { search } = useLocation();
  const searchObj = qs.parse(search);

  return {
    state,
    search: searchObj,
    mergeData: { ...state, ...searchObj },
  };
}
