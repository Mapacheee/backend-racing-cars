import { Repository } from 'typeorm';
import { Track } from './entities/track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
export declare class TracksService {
    private tracksRepository;
    constructor(tracksRepository: Repository<Track>);
    create(createTrackDto: CreateTrackDto): Promise<Track>;
    findAll(onlyActive?: boolean): Promise<Track[]>;
    findOne(id: string): Promise<Track>;
    update(id: string, updateTrackDto: UpdateTrackDto): Promise<Track>;
    remove(id: string): Promise<void>;
}
