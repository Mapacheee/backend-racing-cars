export interface NodeGene {
  id: number;
  type: 'input' | 'hidden' | 'output';
  layer: number;
  value?: number;
}

export interface Gene {
  innovation: number;
  from: number;
  to: number;
  weight: number;
  enabled: boolean;
}

export interface Genome {
  id: string;
  nodeGenes: NodeGene[];
  connectionGenes: Gene[];
  fitness: number;
  adjustedFitness: number;
  species?: number;
}

export interface NEATConfig {
  populationSize: number;
  inputNodes: number;
  outputNodes: number;
  mutationRates: {
    addNode: number;
    addConnection: number;
    weightMutation: number;
    disableConnection: number;
    weightPerturbation: number;
  };
  speciation: {
    compatibilityThreshold: number;
    c1: number;
    c2: number;
    c3: number;
  };
  survival: {
    survivalRate: number;
    eliteSize: number;
  };
}
