declare namespace Github {
    class Repository {
        id: number;
        name: string;
    }
    
    interface RepositoriesResponse {
        total_count: number,
        repositories: Repository[]
    }
    
    interface Installation {
        id: number;
    }
    
    interface InstallationsResponse {
        total_count: number,
        installations: Installation[]
    }

    interface User {
        login: string,
        id: number,
        avatar_url: string
    }
}