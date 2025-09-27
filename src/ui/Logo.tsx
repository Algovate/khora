import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import figlet from 'figlet';
import gradient from 'gradient-string';

// Render a large ASCII wordmark with a cyan→magenta gradient, plus a small tagline
export default function Logo(): React.ReactElement {
  const ascii = useMemo(() => {
    return figlet.textSync('khora', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    });
  }, []);

  const gradientLines = useMemo(() => {
    const lines = ascii.split('\n');
    // Create a vertical gradient across lines
    const colors = gradient(['#00e5ff', '#b5179e']).multiline(lines.join('\n'));
    return colors.split('\n');
  }, [ascii]);

  return (
    <Box flexDirection="column" marginBottom={1}>
      {gradientLines.map((line, idx) => (
        <Text key={idx}>{line}</Text>
      ))}
      <Text color="gray">Fast, minimal AI in your terminal</Text>
    </Box>
  );
}


