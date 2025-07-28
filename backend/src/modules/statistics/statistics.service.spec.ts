import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatisticsService } from './statistics.service';
import { RaceStatistics } from './entities/race-statistics.entity';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let repository: Repository<RaceStatistics>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(RaceStatistics),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    repository = module.get<Repository<RaceStatistics>>(getRepositoryToken(RaceStatistics));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create race statistics', async () => {
      const createDto = {
        participants: [{
          aiModelId: '123',
          position: 1,
          distanceCompleted: 100,
          lapTimes: [10, 11, 12]
        }],
        trackInfo: {
          trackId: '456',
          trackName: 'Test Track',
          numberOfLaps: 3
        }
      };

      const expectedResult = { id: 1, ...createDto };
      mockRepository.create.mockReturnValue(expectedResult);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);
      expect(result).toEqual(expectedResult);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('getAIModelStats', () => {
    it('should return AI model statistics', async () => {
      const mockRaces = [{
        participants: [{
          aiModelId: '123',
          position: 1,
          distanceCompleted: 100,
          lapTimes: [10, 11, 12]
        }]
      }];

      mockRepository.createQueryBuilder().getMany.mockResolvedValueOnce(mockRaces);

      const result = await service.getAIModelStats('123');
      expect(result).toBeDefined();
      expect(result.totalRaces).toBe(1);
      expect(result.positions).toContain(1);
      expect(result.lapTimes).toEqual([10, 11, 12]);
    });
  });

  describe('getTrackLeaderboard', () => {
    it('should return track leaderboard', async () => {
      const mockRaces = [{
        participants: [{
          aiModelId: '123',
          position: 1,
          lapTimes: [10, 11, 12]
        }]
      }];

      mockRepository.createQueryBuilder().getMany.mockResolvedValueOnce(mockRaces);

      const result = await service.getTrackLeaderboard('456');
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].aiModelId).toBe('123');
      expect(result[0].wins).toBe(1);
    });
  });
});
