export const codeBlockFormat = (code: Object | string): string => {
  const codePrettify = code instanceof Object ? JSON.stringify(code, null, "\t") : code;
  return `\`\`\`${codePrettify}\`\`\``;
};

export const inlineCodeFormat = (code: string): string => {
  return `\`${code}\``;
};

export const tagUserFormat = (user: string): string => {
  return `<@${user}>`;
};

export const prettifySlackMessage = (text: string): string => {
  return text.replace(/ +(?= )/g, "");
};
