declare namespace Github {
    class Repository {
        id: number;
        name: string;
        owner: User;
    }
    
    interface RepositoriesResponse {
        total_count: number,
        repositories: Repository[]
    }
    
    interface Installation {
        id: number;
        app_id: number;
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

    interface Content {
        type: "file" | "symlink" | "dir",
        name: string,
        size: number,
        path: string
    }
}