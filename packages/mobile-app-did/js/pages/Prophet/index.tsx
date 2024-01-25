import React from 'react';
import { Button } from 'react-native';
import { PagePerformanceProphet } from './useProphet';

export const ProphetReportPage = () => {
  return (
    <>
      <Button
        title="Prophet Report"
        onPress={() => {
          PagePerformanceProphet.printReport();
        }}
      />
    </>
  );
};
