import { useEffectOnce } from '@portkey-wallet/hooks';

export class Prophet {
  private pageData: PageData[] = [];

  reportStartJump = (name: string) => {
    this.pageData.push({
      name,
      startTime: Date.now(),
      gap: 0,
    });
  };

  reportEndJump = () => {
    const pageData = this.pageData[this.pageData.length - 1];
    if (pageData) {
      if (pageData.endTime) {
        throw new Error('reportEndJump should not be called twice, please check your code');
      }
      pageData.endTime = Date.now();
      pageData.gap = pageData.endTime - pageData.startTime;
    }
  };

  printReport = () => {
    const raw = this.pageData;
    const averagePerformancePerPage: { [key: string]: PageData } = {};
    let worstPerformance = raw[0];
    let bestPerformance = raw[0];
    raw.forEach(pageData => {
      const { name, gap } = pageData;
      if (gap) {
        if (gap > worstPerformance.gap) {
          worstPerformance = pageData;
        }
        if (gap < bestPerformance.gap) {
          bestPerformance = pageData;
        }
        if (averagePerformancePerPage[name]) {
          averagePerformancePerPage[name].gap += gap;
        } else {
          averagePerformancePerPage[name] = pageData;
        }
      }
    });
    Object.keys(averagePerformancePerPage).forEach(key => {
      averagePerformancePerPage[key].gap /= raw.length;
    });
    console.log('Prophet Report: ', {
      worstPerformance,
      bestPerformance,
      averagePerformancePerPage,
      raw,
    });
  };
}

export const PagePerformanceProphet = new Prophet();

export const useProphet = () => {
  useEffectOnce(() => {
    PagePerformanceProphet.reportEndJump();
  });
};

export interface PageData {
  name: string;
  startTime: number;
  endTime?: number;
  gap: number;
}

export interface ProphetReport {
  worstPerformance: PageData;
  bestPerformance: PageData;
  averagePerformancePerPage: {
    [key: string]: PageData;
  };
  raw: PageData[];
}
