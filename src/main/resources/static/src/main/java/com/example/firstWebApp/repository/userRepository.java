
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface userRepository extends JpaRepository<user,Long> {
    Optional<user> findByUsername(String username);
    Optional<user> findByUsernameAndPassword(String username, String password);
}
