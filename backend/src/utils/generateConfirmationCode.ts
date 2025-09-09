const generateConfirmationCode = (): string => {
  const letters = [
    'A','a','B','b','C','c','D','d','E','e','F','f','G','g',
    'H','h','I','i','J','j','K','k','L','l','M','m','N','n',
    'O','o','P','p','Q','q','R','r','S','s','T','t','U','u',
    'V','v','W','w','X','x','Y','y','Z','z'
  ];
  const digits = '0123456789';

  const all = [...letters, ...digits.split('')];
  let code = '';

  for (let i = 0; i < 6; i++) {
    const randIndex = Math.floor(Math.random() * all.length);
    code += all[randIndex];
  };

  return code;
};

export default generateConfirmationCode;
