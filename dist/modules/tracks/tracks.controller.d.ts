import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
export declare class TracksController {
    private readonly tracksService;
    constructor(tracksService: TracksService);
    create(createTrackDto: CreateTrackDto): Promise<import("./entities/track.entity").Track>;
    findAll(active?: string): Promise<import("./entities/track.entity").Track[]>;
    findOne(id: string): Promise<import("./entities/track.entity").Track>;
    update(id: string, updateTrackDto: UpdateTrackDto): Promise<import("./entities/track.entity").Track>;
    remove(id: string): Promise<void>;
}
