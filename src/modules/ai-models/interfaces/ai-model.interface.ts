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
    c1: number; // Coeficiente excess genes
    c2: number; // Coeficiente disjoint genes
    c3: number; // Coeficiente weight differences
  };
  survival: {
    survivalRate: number;
    eliteSize: number;
  };
}
