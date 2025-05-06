export const marketCapData = Array.from({ length: 12 }, (_, i) => ({
  rank: i + 1,
  name: "Lorem (Ipsum)",
  marketCap: "$132,174,021,224",
  raisedToken: "EPIX",
}));

export const tradingVolumeData = Array.from({ length: 12 }, (_, i) => ({
  rank: i + 1,
  name: "Lorem (Ipsum)",
  marketCap: "$132,174,021,224",
  volume: "$132,174,021,224",
  raisedToken: "EPIX",
}));

export const trendingTokensData = [
  { id: 1, name: "sandwich / EPIX", volume: "0.4308", unit: "EPIX" },
  { id: 2, name: "sandwich / EPIX", volume: "0.4308", unit: "EPIX" },
  { id: 3, name: "sandwich / EPIX", volume: "0.4308", unit: "EPIX" },
  { id: 4, name: "sandwich / EPIX", volume: "0.4308", unit: "EPIX" },
] as const;
