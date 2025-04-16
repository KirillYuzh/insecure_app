// package auth.service.controller;

// import auth.service.dto.AuthRequest;
// import auth.service.dto.AuthResponse;
// import auth.service.dto.RegisterRequest;
// import auth.service.model.User;
// import auth.service.repository.UserRepository;
// import auth.service.security.JwtService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// @RestController
// @RequestMapping("/api/auth")
// @RequiredArgsConstructor
// public class AuthController {

//     private final UserRepository userRepository;
//     private final PasswordEncoder passwordEncoder;
//     private final JwtService jwtService;
//     private final AuthenticationManager authenticationManager;

//     @PostMapping("/register")
//     public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
//         var user = User.builder()
//                 .email(request.getEmail())
//                 .password(passwordEncoder.encode(request.getPassword()))
//                 .build();
//         userRepository.save(user);
        
//         var jwtToken = jwtService.generateToken(user);
//         return ResponseEntity.ok(AuthResponse.builder()
//                 .token(jwtToken)
//                 .build());
//     }

//     @PostMapping("/authenticate")
//     public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request) {
//         Authentication authentication = authenticationManager.authenticate(
//                 new UsernamePasswordAuthenticationToken(
//                         request.getEmail(),
//                         request.getPassword()
//                 )
//         );
        
//         var user = (User) authentication.getPrincipal();
//         var jwtToken = jwtService.generateToken(user);
//         return ResponseEntity.ok(AuthResponse.builder()
//                 .token(jwtToken)
//                 .build());
//     }
// }